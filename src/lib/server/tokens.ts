import 'server-only'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { getDb, nowIso } from './db'

export const TOKEN_REGEX = /^[A-Za-z0-9_-]{32}$/

export type TokenEntry = {
  id: string
  label: string
  role?: string
  hash: string
  createdAt: string
  expiresAt: string | null
  revoked: boolean
  viewCount: number
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function isValidTokenFormat(token: string): boolean {
  return TOKEN_REGEX.test(token)
}

export function generatePlainToken(): string {
  return randomBytes(24).toString('base64url')
}

function rowToEntry(row: Record<string, unknown>): TokenEntry {
  return {
    id: String(row.id),
    label: String(row.label),
    role: row.role ? String(row.role) : undefined,
    hash: String(row.hash),
    createdAt: String(row.created_at),
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    revoked: Boolean(row.revoked),
    viewCount: Number(row.view_count ?? 0),
  }
}

export function listTokens(): TokenEntry[] {
  const db = getDb()
  const rows = db
    .prepare(
      'SELECT id, label, role, hash, created_at, expires_at, revoked, view_count FROM tokens ORDER BY created_at DESC',
    )
    .all() as Record<string, unknown>[]
  return rows.map(rowToEntry)
}

export function findTokenByPlaintext(token: string): TokenEntry | null {
  if (!isValidTokenFormat(token)) {
    return null
  }

  const digest = Buffer.from(hashToken(token), 'hex')
  const rows = listTokens()
  let match: TokenEntry | null = null

  for (const entry of rows) {
    try {
      const entryHash = Buffer.from(entry.hash, 'hex')
      if (entryHash.length !== digest.length) continue
      if (timingSafeEqual(entryHash, digest)) {
        match = entry
      }
    } catch {
      continue
    }
  }

  return match
}

export function findTokenById(id: string): TokenEntry | null {
  const db = getDb()
  const row = db
    .prepare(
      'SELECT id, label, role, hash, created_at, expires_at, revoked, view_count FROM tokens WHERE id = ?',
    )
    .get(id) as Record<string, unknown> | undefined
  return row ? rowToEntry(row) : null
}

export function createToken(input: {
  label: string
  role?: string
  expiresAt?: string | null
}): { entry: TokenEntry; plaintext: string } {
  const db = getDb()
  const plaintext = generatePlainToken()
  const id = slugify(input.label) || `token-${Date.now()}`
  const createdAt = nowIso()
  let finalId = id
  let n = 1
  while (findTokenById(finalId)) {
    finalId = `${id}-${n++}`
  }

  db.prepare(
    `INSERT INTO tokens (id, label, role, hash, created_at, expires_at, revoked, view_count)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
  ).run(
    finalId,
    input.label,
    input.role ?? null,
    hashToken(plaintext),
    createdAt,
    input.expiresAt ?? null,
  )

  return {
    plaintext,
    entry: {
      id: finalId,
      label: input.label,
      role: input.role,
      hash: hashToken(plaintext),
      createdAt,
      expiresAt: input.expiresAt ?? null,
      revoked: false,
      viewCount: 0,
    },
  }
}

export function updateToken(
  id: string,
  patch: { label?: string; role?: string | null; expiresAt?: string | null },
) {
  const existing = findTokenById(id)
  if (!existing) return null
  const db = getDb()
  db.prepare(
    `UPDATE tokens SET label = ?, role = ?, expires_at = ? WHERE id = ?`,
  ).run(
    patch.label ?? existing.label,
    patch.role === undefined ? (existing.role ?? null) : patch.role,
    patch.expiresAt === undefined ? existing.expiresAt : patch.expiresAt,
    id,
  )
  return findTokenById(id)
}

export function revokeToken(id: string) {
  getDb().prepare('UPDATE tokens SET revoked = 1 WHERE id = ?').run(id)
}

export function deleteToken(id: string) {
  getDb().prepare('DELETE FROM tokens WHERE id = ?').run(id)
}

export function incrementTokenView(
  tokenId: string,
  meta?: { lang?: string; agent?: string },
) {
  const db = getDb()
  db.prepare('UPDATE tokens SET view_count = view_count + 1 WHERE id = ?').run(
    tokenId,
  )
  db.prepare(
    'INSERT INTO token_views (token_id, viewed_at, lang, agent) VALUES (?, ?, ?, ?)',
  ).run(tokenId, nowIso(), meta?.lang ?? null, meta?.agent ?? null)
}

export function tokenStats() {
  const db = getDb()
  const totals = db
    .prepare(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN revoked = 0 AND (expires_at IS NULL OR expires_at > datetime('now')) THEN 1 ELSE 0 END) AS active,
        SUM(view_count) AS views
       FROM tokens`,
    )
    .get() as { total: number; active: number; views: number }
  return {
    total: Number(totals.total ?? 0),
    active: Number(totals.active ?? 0),
    views: Number(totals.views ?? 0),
  }
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}
