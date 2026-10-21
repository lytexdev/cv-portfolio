import 'server-only'
import { getDb, nowIso } from './db'
import { getEnv } from './env'
import { hashPassword, safeEqualString, verifyPassword } from './password'
import { checkRateLimit } from './rate-limit'
import { verifyTotp } from './totp'

export type AdminRow = {
  id: number
  username: string
  password_hash: string
  totp_secret: string | null
  totp_enabled: number
  must_change_credentials: number
  failed_attempts: number
  locked_until: string | null
}

export function getAdminByUsername(username: string): AdminRow | null {
  const row = getDb()
    .prepare('SELECT * FROM admins WHERE username = ? COLLATE NOCASE')
    .get(username) as AdminRow | undefined
  return row ?? null
}

export function getAdminById(id: number): AdminRow | null {
  const row = getDb()
    .prepare('SELECT * FROM admins WHERE id = ?')
    .get(id) as AdminRow | undefined
  return row ?? null
}

export type LoginResult =
  | { ok: true; admin: AdminRow }
  | { ok: false; error: string; status: number }

export function attemptLogin(input: {
  username: string
  password: string
  phrase: string
  totp?: string
  ip: string
}): LoginResult {
  const rate = checkRateLimit(
    `login:${input.ip}:${input.username.toLowerCase()}`,
    8,
    15 * 60 * 1000,
    15 * 60 * 1000,
  )
  if (!rate.allowed) {
    return { ok: false, error: 'Too many attempts. Try again later.', status: 429 }
  }

  const env = getEnv()
  const phraseOk = safeEqualString(input.phrase, env.secretAdminPhrase)
  const admin = getAdminByUsername(input.username)

  if (!admin || !phraseOk) {
    return { ok: false, error: 'Invalid credentials.', status: 401 }
  }

  if (admin.locked_until && Date.parse(admin.locked_until) > Date.now()) {
    return { ok: false, error: 'Account locked. Try again later.', status: 429 }
  }

  const passwordOk = verifyPassword(input.password, admin.password_hash)
  if (!passwordOk) {
    const attempts = admin.failed_attempts + 1
    const lockedUntil =
      attempts >= 8 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
    getDb()
      .prepare(
        'UPDATE admins SET failed_attempts = ?, locked_until = ?, updated_at = ? WHERE id = ?',
      )
      .run(attempts, lockedUntil, nowIso(), admin.id)
    return { ok: false, error: 'Invalid credentials.', status: 401 }
  }

  if (admin.totp_enabled) {
    if (!admin.totp_secret || !input.totp || !verifyTotp(admin.totp_secret, input.totp)) {
      return { ok: false, error: 'Invalid TOTP code.', status: 401 }
    }
  }

  getDb()
    .prepare(
      'UPDATE admins SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?',
    )
    .run(nowIso(), admin.id)

  return { ok: true, admin }
}

export function updateAdminCredentials(
  id: number,
  input: { username: string; password: string },
) {
  const hash = hashPassword(input.password)
  getDb()
    .prepare(
      `UPDATE admins SET username = ?, password_hash = ?, must_change_credentials = 0, updated_at = ? WHERE id = ?`,
    )
    .run(input.username, hash, nowIso(), id)
}

export function setTotpSecret(id: number, secret: string | null, enabled: boolean) {
  getDb()
    .prepare(
      'UPDATE admins SET totp_secret = ?, totp_enabled = ?, updated_at = ? WHERE id = ?',
    )
    .run(secret, enabled ? 1 : 0, nowIso(), id)
}
