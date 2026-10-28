import 'server-only'
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
  PDFStream,
  type PDFObject,
} from 'pdf-lib'

const MAX_PAGES = 100

const STRIPPED_KEYS = [
  'AA',
  'AcroForm',
  'Annots',
  'EmbeddedFile',
  'EmbeddedFiles',
  'JS',
  'JavaScript',
  'Launch',
  'Metadata',
  'OpenAction',
  'PieceInfo',
  'Thumb',
  'URI',
].map((key) => PDFName.of(key))

const DCT_DECODE = PDFName.of('DCTDecode')
const FILTER = PDFName.of('Filter')

const JPEG_KEPT_APP_MARKERS = new Set([0xe0, 0xee])
const JPEG_COMMENT = 0xfe
const JPEG_START_OF_SCAN = 0xda

export class PdfRejectedError extends Error {
  readonly reason: 'invalid' | 'encrypted' | 'pages'

  constructor(reason: 'invalid' | 'encrypted' | 'pages') {
    super(`PDF rejected (${reason})`)
    this.name = 'PdfRejectedError'
    this.reason = reason
  }
}

function scrub(object: PDFObject | undefined, seen: Set<PDFObject>) {
  if (!object || seen.has(object)) return
  seen.add(object)
  const dict = object instanceof PDFDict ? object : object instanceof PDFStream ? object.dict : null
  if (dict) {
    for (const key of STRIPPED_KEYS) dict.delete(key)
    for (const [, value] of dict.entries()) scrub(value, seen)
    return
  }
  if (object instanceof PDFArray) {
    for (let i = 0; i < object.size(); i++) scrub(object.get(i), seen)
  }
}

function hasOnlyDctFilter(dict: PDFDict): boolean {
  const filter = dict.get(FILTER)
  if (filter === DCT_DECODE) return true
  return filter instanceof PDFArray && filter.size() === 1 && filter.get(0) === DCT_DECODE
}

export function stripJpegMetadata(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes
  const kept: Uint8Array[] = [bytes.subarray(0, 2)]
  let pos = 2
  let changed = false

  while (pos + 4 <= bytes.length) {
    if (bytes[pos] !== 0xff) return bytes
    const marker = bytes[pos + 1] ?? 0
    if (marker === JPEG_START_OF_SCAN) {
      kept.push(bytes.subarray(pos))
      return changed ? concat(kept) : bytes
    }
    const length = ((bytes[pos + 2] ?? 0) << 8) | (bytes[pos + 3] ?? 0)
    if (length < 2 || pos + 2 + length > bytes.length) return bytes
    const segment = bytes.subarray(pos, pos + 2 + length)
    const isApp = marker >= 0xe0 && marker <= 0xef
    if ((isApp && !JPEG_KEPT_APP_MARKERS.has(marker)) || marker === JPEG_COMMENT) {
      changed = true
    } else {
      kept.push(segment)
    }
    pos += 2 + length
  }
  return bytes
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

export async function sanitizePdf(input: Buffer): Promise<Buffer> {
  let encrypted: boolean
  try {
    const probe = await PDFDocument.load(input, { updateMetadata: false, ignoreEncryption: true })
    encrypted = probe.isEncrypted
  } catch {
    throw new PdfRejectedError('invalid')
  }
  if (encrypted) throw new PdfRejectedError('encrypted')

  let source: PDFDocument
  try {
    source = await PDFDocument.load(input, { updateMetadata: false, throwOnInvalidObject: true })
  } catch {
    throw new PdfRejectedError('invalid')
  }

  try {
    source.getForm().flatten()
  } catch {
    throw new PdfRejectedError('invalid')
  }

  const pageCount = source.getPageCount()
  if (pageCount === 0) throw new PdfRejectedError('invalid')
  if (pageCount > MAX_PAGES) throw new PdfRejectedError('pages')

  const seen = new Set<PDFObject>()
  const jpegStreams: Array<[Parameters<typeof source.context.assign>[0], PDFRawStream]> = []
  for (const [ref, object] of source.context.enumerateIndirectObjects()) {
    scrub(object, seen)
    if (object instanceof PDFRawStream && hasOnlyDctFilter(object.dict)) {
      jpegStreams.push([ref, object])
    }
  }
  for (const [ref, stream] of jpegStreams) {
    const cleaned = stripJpegMetadata(stream.contents)
    if (cleaned !== stream.contents) {
      source.context.assign(ref, PDFRawStream.of(stream.dict, cleaned))
    }
  }

  const output = await PDFDocument.create({ updateMetadata: false })
  const pages = await output.copyPages(source, source.getPageIndices())
  for (const page of pages) output.addPage(page)
  return Buffer.from(await output.save({ useObjectStreams: true }))
}
