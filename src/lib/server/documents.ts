import 'server-only'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { getDataDir } from './data-dir'
import { getDb, nowIso } from './db'
import { PdfRejectedError, sanitizePdf } from './pdf-sanitize'
import { isSupportedImage } from './uploads'

export const MAX_DOCUMENT_BYTES = 9 * 1024 * 1024
const MAX_IMAGE_EDGE = 2400
const MAX_INPUT_PIXELS = 60_000_000
const DOCUMENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export type DocumentKind = 'pdf' | 'image'

export type ExperienceDocument = {
  id: string
  experienceId: string
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

function toDocument(row: Record<string, unknown>): ExperienceDocument {
  return {
    id: String(row.id),
    experienceId: String(row.experience_id),
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

export function listExperienceDocuments(experienceId?: string): ExperienceDocument[] {
  const db = getDb()
  const rows = experienceId
    ? db
        .prepare(
          'SELECT * FROM experience_documents WHERE experience_id = ? ORDER BY sort_order, created_at',
        )
        .all(experienceId)
    : db.prepare('SELECT * FROM experience_documents ORDER BY sort_order, created_at').all()
  return (rows as Record<string, unknown>[]).map(toDocument)
}

export function listDocumentsByExperience(): Record<string, ExperienceDocument[]> {
  const grouped: Record<string, ExperienceDocument[]> = {}
  for (const document of listExperienceDocuments()) {
    grouped[document.experienceId] = [...(grouped[document.experienceId] ?? []), document]
  }
  return grouped
}

export function getExperienceDocument(id: string): ExperienceDocument | null {
  if (!isDocumentId(id)) return null
  const row = getDb().prepare('SELECT * FROM experience_documents WHERE id = ?').get(id)
  return row ? toDocument(row as Record<string, unknown>) : null
}

export function documentFilePath(document: ExperienceDocument): string | null {
  const absolute = path.join(documentsDir(), document.filename)
  if (path.dirname(absolute) !== documentsDir() || !existsSync(absolute)) return null
  return absolute
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

export async function addExperienceDocument(input: {
  experienceId: string
  label: { de: string; en: string }
  file: Buffer
}): Promise<ExperienceDocument> {
  const { kind, data } = await sanitize(input.file)
  const id = randomUUID()
  const filename = `${id}.${kind === 'pdf' ? 'pdf' : 'webp'}`
  mkdirSync(documentsDir(), { recursive: true, mode: 0o700 })
  writeFileSync(path.join(documentsDir(), filename), data, { mode: 0o600 })

  const db = getDb()
  const next = db
    .prepare(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM experience_documents WHERE experience_id = ?',
    )
    .get(input.experienceId) as { next: number }
  db.prepare(
    `INSERT INTO experience_documents
      (id, experience_id, sort_order, label_de, label_en, kind, filename, size, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.experienceId,
    next.next,
    input.label.de,
    input.label.en,
    kind,
    filename,
    data.length,
    nowIso(),
  )

  const created = getExperienceDocument(id)
  if (!created) throw new DocumentRejectedError('invalid')
  return created
}

function removeFile(document: ExperienceDocument) {
  const absolute = documentFilePath(document)
  if (absolute) rmSync(absolute, { force: true })
}

export function deleteExperienceDocument(id: string) {
  const document = getExperienceDocument(id)
  if (!document) return
  removeFile(document)
  getDb().prepare('DELETE FROM experience_documents WHERE id = ?').run(id)
}

export function deleteDocumentsForExperience(experienceId: string) {
  for (const document of listExperienceDocuments(experienceId)) {
    deleteExperienceDocument(document.id)
  }
}

export function reorderExperienceDocuments(experienceId: string, order: string[]) {
  const update = getDb().prepare(
    'UPDATE experience_documents SET sort_order = ? WHERE id = ? AND experience_id = ?',
  )
  order.forEach((id, index) => update.run(index, id, experienceId))
}
