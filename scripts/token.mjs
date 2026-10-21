import { createHash, randomBytes } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { DatabaseSync } from 'node:sqlite'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

try {
  process.loadEnvFile(path.join(root, '.env'))
} catch {
  try {
    process.loadEnvFile(path.join(root, '.env.production'))
  } catch {
    // ignore
  }
}

function getDataDir() {
  if (process.env.CV_DATA_DIR) {
    return process.env.CV_DATA_DIR
  }
  return path.resolve(process.cwd(), 'data')
}

function hashToken(token) {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

function generateToken() {
  return randomBytes(24).toString('base64url')
}

function slugify(label) {
  return label
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

function openDb() {
  const dir = getDataDir()
  mkdirSync(dir, { recursive: true })
  const db = new DatabaseSync(path.join(dir, 'cv.sqlite'))
  db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      role TEXT,
      hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT,
      revoked INTEGER NOT NULL DEFAULT 0,
      view_count INTEGER NOT NULL DEFAULT 0
    );
  `)
  return db
}

function resolveBaseUrl(flagValue) {
  const base = flagValue || process.env.PUBLIC_BASE_URL
  if (!base) {
    console.error('Missing base URL. Pass --base-url or set PUBLIC_BASE_URL.')
    process.exit(1)
  }
  return base.replace(/\/$/, '')
}

function tokenStatus(entry, now = Date.now()) {
  if (entry.revoked) return 'revoked'
  if (entry.expires_at && Date.parse(entry.expires_at) < now) return 'expired'
  return 'active'
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    label: { type: 'string', short: 'l' },
    role: { type: 'string', short: 'r' },
    expires: { type: 'string', short: 'e' },
    'base-url': { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
})

const command = positionals[0]

if (values.help || !command) {
  console.log(`Usage:
  npm run token -- create --label "Acme" [--role "Frontend"] [--expires 2027-01-01] [--base-url URL]
  npm run token -- list
  npm run token -- revoke <id>
`)
  process.exit(0)
}

const db = openDb()

if (command === 'create') {
  const label = values.label
  if (!label) {
    console.error('Missing --label')
    process.exit(1)
  }
  const plaintext = generateToken()
  let id = slugify(label) || `token-${Date.now()}`
  let n = 1
  while (db.prepare('SELECT 1 FROM tokens WHERE id = ?').get(id)) {
    id = `${slugify(label)}-${n++}`
  }
  const createdAt = new Date().toISOString()
  const expiresAt = values.expires
    ? new Date(values.expires).toISOString()
    : null
  db.prepare(
    `INSERT INTO tokens (id, label, role, hash, created_at, expires_at, revoked, view_count)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
  ).run(id, label, values.role ?? null, hashToken(plaintext), createdAt, expiresAt)

  const base = resolveBaseUrl(values['base-url'])
  console.log(
    JSON.stringify(
      {
        id,
        label,
        role: values.role ?? null,
        expiresAt,
        token: plaintext,
        urlDe: `${base}/de?k=${plaintext}`,
        urlEn: `${base}/en?k=${plaintext}`,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

if (command === 'list') {
  const rows = db
    .prepare(
      'SELECT id, label, role, created_at, expires_at, revoked, view_count FROM tokens ORDER BY created_at DESC',
    )
    .all()
  for (const row of rows) {
    console.log(
      `${row.id}\t${tokenStatus(row)}\tviews=${row.view_count}\t${row.label}${row.role ? ` (${row.role})` : ''}`,
    )
  }
  process.exit(0)
}

if (command === 'revoke') {
  const id = positionals[1]
  if (!id) {
    console.error('Missing token id')
    process.exit(1)
  }
  db.prepare('UPDATE tokens SET revoked = 1 WHERE id = ?').run(id)
  console.log(`Revoked ${id}`)
  process.exit(0)
}

console.error(`Unknown command: ${command}`)
process.exit(1)
