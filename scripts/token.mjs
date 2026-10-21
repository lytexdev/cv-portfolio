import { createHash, randomBytes } from 'node:crypto'
import { renameSync, writeFileSync, readFileSync, existsSync, mkdirSync, chmodSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

try {
  process.loadEnvFile(path.join(root, '.env'))
} catch {
}

function getDataDir() {
  if (process.env.CV_DATA_DIR) {
    return process.env.CV_DATA_DIR
  }
  return path.resolve(process.cwd(), 'data')
}

function tokensPath() {
  return path.join(getDataDir(), 'tokens.json')
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

function emptyFile() {
  return { version: 1, tokens: [] }
}

function readTokens() {
  const filePath = tokensPath()
  if (!existsSync(filePath)) {
    return emptyFile()
  }
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function writeTokensAtomic(data) {
  const dir = getDataDir()
  mkdirSync(dir, { recursive: true })
  const filePath = tokensPath()
  const tempPath = path.join(dir, `.tokens.${process.pid}.${Date.now()}.tmp`)
  writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 })
  chmodSync(tempPath, 0o600)
  renameSync(tempPath, filePath)
  chmodSync(filePath, 0o600)
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
  if (entry.expiresAt && Date.parse(entry.expiresAt) < now) return 'expired'
  return 'active'
}

function cmdAdd(values) {
  const label = values.label
  if (!label) {
    console.error('Missing --label')
    process.exit(1)
  }

  const lang = values.lang === 'en' ? 'en' : 'de'
  const baseUrl = resolveBaseUrl(values['base-url'])
  const now = new Date()
  const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  const id = values.id || `${slugify(label)}-${ym}`
  const data = readTokens()

  if (data.tokens.some((t) => t.id === id)) {
    console.error(`Token id already exists: ${id}`)
    process.exit(1)
  }

  let expiresAt = null
  if (values.expires) {
    const parsed = Date.parse(`${values.expires}T23:59:59.000Z`)
    if (Number.isNaN(parsed)) {
      console.error('Invalid --expires, expected YYYY-MM-DD')
      process.exit(1)
    }
    expiresAt = new Date(parsed).toISOString()
  }

  const token = generateToken()
  data.tokens.push({
    id,
    label,
    role: values.role || undefined,
    hash: hashToken(token),
    createdAt: now.toISOString(),
    expiresAt,
    revoked: false,
  })

  writeTokensAtomic(data)
  console.log(`${baseUrl}/${lang}?k=${token}`)
}

function cmdList() {
  const data = readTokens()
  if (data.tokens.length === 0) {
    console.log('No tokens.')
    return
  }

  const rows = data.tokens.map((t) => ({
    id: t.id,
    label: t.label,
    role: t.role || '',
    createdAt: t.createdAt,
    expiresAt: t.expiresAt || '',
    status: tokenStatus(t),
  }))

  const headers = ['id', 'label', 'role', 'createdAt', 'expiresAt', 'status']
  const widths = Object.fromEntries(
    headers.map((h) => [h, Math.max(h.length, ...rows.map((r) => String(r[h]).length))]),
  )

  console.log(headers.map((h) => h.padEnd(widths[h])).join('  '))
  for (const row of rows) {
    console.log(headers.map((h) => String(row[h]).padEnd(widths[h])).join('  '))
  }
}

function cmdRevoke(id) {
  if (!id) {
    console.error('Missing id')
    process.exit(1)
  }
  const data = readTokens()
  const entry = data.tokens.find((t) => t.id === id)
  if (!entry) {
    console.error(`Unknown id: ${id}`)
    process.exit(1)
  }
  entry.revoked = true
  writeTokensAtomic(data)
  console.log(`Revoked ${id}`)
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    label: { type: 'string' },
    role: { type: 'string' },
    lang: { type: 'string' },
    expires: { type: 'string' },
    id: { type: 'string' },
    'base-url': { type: 'string' },
  },
})

const command = positionals[0]

if (command === 'add') {
  cmdAdd(values)
} else if (command === 'list') {
  cmdList()
} else if (command === 'revoke') {
  cmdRevoke(positionals[1])
} else {
  console.error('Usage: token.mjs <add|list|revoke> …')
  process.exit(1)
}
