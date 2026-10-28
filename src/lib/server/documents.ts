import 'server-only'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { getDataDir } from './data-dir'
import { getDb, nowIso } from './db'
import { PdfRejectedError, sanitizePdf } from './pdf-sanitize'
import { isSupportedImage } from './uploads'
import type { DocumentLink } from '@/components/content/DocumentList'
import type { Locale } from '@/content/types'

export const MAX_DOCUMENT_BYTES = 9 * 1024 * 1024
const MAX_IMAGE_EDGE = 2400
const MAX_INPUT_PIXELS = 60_000_000
const DOCUMENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export type DocumentKind = 'pdf' | 'image'

export type DocumentOwnerType = 'experience' | 'project'

export type DocumentOwner = { type: DocumentOwnerType; id: string }

export type StoredDocument = {
  id: string
  owner: DocumentOwner
  sortOrder: number
  label: { de: string; en: string }
  kind: DocumentKind
  filename: string
  size: number
  createdAt: string
}

export type DocumentRejection = 'size' | 'type' | 'encrypted' | 'pages' | 'invalid'

export class DocumentRejectedError extends Error {
  readonly reason: DocumentRejection

  constructor(reason: DocumentRejection) {
    super(`Document rejected (${reason})`)
    this.name = 'DocumentRejectedError'
    this.reason = reason
  }
}

function documentsDir(): string {
  return path.join(getDataDir(), 'uploads', 'documents')
}

function toDocument(row: Record<string, unknown>): StoredDocument {
  return {
    id: String(row.id),
    owner: {
      type: row.owner_type === 'project' ? 'project' : 'experience',
      id: String(row.owner_id),
    },
    sortOrder: Number(row.sort_order),
    label: { de: String(row.label_de), en: String(row.label_en) },
    kind: row.kind === 'pdf' ? 'pdf' : 'image',
    filename: String(row.filename),
    size: Number(row.size),
    createdAt: String(row.created_at),
  }
}

export function isDocumentId(value: string): boolean {
  return DOCUMENT_ID.test(value)
}

export function isDocumentOwnerType(value: string): value is DocumentOwnerType {
  return value === 'experience' || value === 'project'
}

export function listDocuments(owner: DocumentOwner): StoredDocument[] {
  const rows = getDb()
    .prepare(
      'SELECT * FROM documents WHERE owner_type = ? AND owner_id = ? ORDER BY sort_order, created_at',
    )
    .all(owner.type, owner.id) as Record<string, unknown>[]
  return rows.map(toDocument)
}

export function getDocument(id: string): StoredDocument | null {
  if (!isDocumentId(id)) return null
  const row = getDb().prepare('SELECT * FROM documents WHERE id = ?').get(id)
  return row ? toDocument(row as Record<string, unknown>) : null
}

export function documentFilePath(document: StoredDocument): string | null {
  const absolute = path.join(documentsDir(), document.filename)
  if (path.dirname(absolute) !== documentsDir() || !existsSync(absolute)) return null
  return absolute
}

export function documentLinks(
  owner: DocumentOwner,
  accessToken: string | undefined,
  locale: Locale,
): DocumentLink[] {
  if (!accessToken) return []
  return listDocuments(owner).map((document) => ({
    id: document.id,
    label: document.label[locale],
    kind: document.kind,
    size: document.size,
    href: `/media/documents/${document.id}?k=${encodeURIComponent(accessToken)}&lang=${locale}`,
  }))
}

async function sanitize(input: Buffer): Promise<{ kind: DocumentKind; data: Buffer }> {
  if (input.length === 0 || input.length > MAX_DOCUMENT_BYTES) {
    throw new DocumentRejectedError('size')
  }
  if (input.subarray(0, 5).toString('latin1') === '%PDF-') {
    try {
      return { kind: 'pdf', data: await sanitizePdf(input) }
    } catch (error) {
      throw new DocumentRejectedError(error instanceof PdfRejectedError ? error.reason : 'invalid')
    }
  }
  if (isSupportedImage(input)) {
    try {
      const data = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
        .rotate()
        .resize({
          width: MAX_IMAGE_EDGE,
          height: MAX_IMAGE_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 86 })
        .toBuffer()
      return { kind: 'image', data }
    } catch {
      throw new DocumentRejectedError('invalid')
    }
  }
  throw new DocumentRejectedError('type')
}

export async function addDocument(input: {
  owner: DocumentOwner
  label: { de: string; en: string }
  file: Buffer
}): Promise<StoredDocument> {
  const { kind, data } = await sanitize(input.file)
  const id = randomUUID()
  const filename = `${id}.${kind === 'pdf' ? 'pdf' : 'webp'}`
  mkdirSync(documentsDir(), { recursive: true, mode: 0o700 })
  writeFileSync(path.join(documentsDir(), filename), data, { mode: 0o600 })

  const db = getDb()
  const next = db
    .prepare(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM documents WHERE owner_type = ? AND owner_id = ?',
    )
    .get(input.owner.type, input.owner.id) as { next: number }
  db.prepare(
    `INSERT INTO documents
      (id, owner_type, owner_id, sort_order, label_de, label_en, kind, filename, size, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.owner.type,
    input.owner.id,
    next.next,
    input.label.de,
    input.label.en,
    kind,
    filename,
    data.length,
    nowIso(),
  )

  const created = getDocument(id)
  if (!created) throw new DocumentRejectedError('invalid')
  return created
}

function removeFile(document: StoredDocument) {
  const absolute = documentFilePath(document)
  if (absolute) rmSync(absolute, { force: true })
}

export function deleteDocument(id: string) {
  const document = getDocument(id)
  if (!document) return
  removeFile(document)
  getDb().prepare('DELETE FROM documents WHERE id = ?').run(id)
}

export function deleteDocumentsForOwner(owner: DocumentOwner) {
  for (const document of listDocuments(owner)) {
    deleteDocument(document.id)
  }
}

export function reorderDocuments(owner: DocumentOwner, order: string[]) {
  const update = getDb().prepare(
    'UPDATE documents SET sort_order = ? WHERE id = ? AND owner_type = ? AND owner_id = ?',
  )
  order.forEach((id, index) => update.run(index, id, owner.type, owner.id))
}
