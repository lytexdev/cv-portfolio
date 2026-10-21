import 'server-only'
import { getDb, nowIso } from './db'

export type AuditCategory =
  | 'security'
  | 'honeypot'
  | 'auth'
  | 'admin'
  | 'viewer'
  | 'ai'

export type AuditRow = {
  id: number
  category: AuditCategory
  event: string
  detail: string | null
  ip: string | null
  createdAt: string
}

export function writeAudit(input: {
  category: AuditCategory
  event: string
  detail?: string
  ip?: string
}) {
  getDb()
    .prepare(
      `INSERT INTO audit_logs (category, event, detail, ip, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.category,
      input.event,
      input.detail ?? null,
      input.ip ?? null,
      nowIso(),
    )
}

export function listAuditLogs(options?: {
  category?: AuditCategory
  limit?: number
}): AuditRow[] {
  const limit = options?.limit ?? 200
  const db = getDb()
  const rows = options?.category
    ? (db
        .prepare(
          `SELECT id, category, event, detail, ip, created_at
           FROM audit_logs WHERE category = ?
           ORDER BY id DESC LIMIT ?`,
        )
        .all(options.category, limit) as Record<string, unknown>[])
    : (db
        .prepare(
          `SELECT id, category, event, detail, ip, created_at
           FROM audit_logs ORDER BY id DESC LIMIT ?`,
        )
        .all(limit) as Record<string, unknown>[])

  return rows.map((row) => ({
    id: Number(row.id),
    category: String(row.category) as AuditCategory,
    event: String(row.event),
    detail: row.detail ? String(row.detail) : null,
    ip: row.ip ? String(row.ip) : null,
    createdAt: String(row.created_at),
  }))
}
