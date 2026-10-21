import 'server-only'
import { getDb } from './db'

export type RateLimitResult = {
  allowed: boolean
  retryAfterSec?: number
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  lockMs = 0,
): RateLimitResult {
  const db = getDb()
  const now = Date.now()
  const row = db
    .prepare(
      'SELECT count, window_start, locked_until FROM rate_limits WHERE key = ?',
    )
    .get(key) as
    | { count: number; window_start: number; locked_until: number | null }
    | undefined

  if (row?.locked_until && row.locked_until > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((row.locked_until - now) / 1000),
    }
  }

  if (!row || now - row.window_start > windowMs) {
    db.prepare(
      `INSERT INTO rate_limits (key, count, window_start, locked_until)
       VALUES (?, 1, ?, NULL)
       ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start, locked_until = NULL`,
    ).run(key, now)
    return { allowed: true }
  }

  const next = row.count + 1
  if (next > limit) {
    const lockedUntil = lockMs > 0 ? now + lockMs : null
    db.prepare(
      'UPDATE rate_limits SET count = ?, locked_until = ? WHERE key = ?',
    ).run(next, lockedUntil, key)
    return {
      allowed: false,
      retryAfterSec: Math.ceil(
        ((lockedUntil ?? row.window_start + windowMs) - now) / 1000,
      ),
    }
  }

  db.prepare('UPDATE rate_limits SET count = ? WHERE key = ?').run(next, key)
  return { allowed: true }
}
