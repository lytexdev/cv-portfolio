import 'server-only'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { getEnv } from './env'

export function createCsrfToken(sessionId: string): string {
  const nonce = randomBytes(16).toString('base64url')
  const sig = createHmac('sha256', getEnv().secretKey)
    .update(`${sessionId}:${nonce}`)
    .digest('base64url')
  return `${nonce}.${sig}`
}

export function verifyCsrfToken(sessionId: string, token: string | null): boolean {
  if (!token) return false
  const [nonce, sig] = token.split('.')
  if (!nonce || !sig) return false
  const expected = createHmac('sha256', getEnv().secretKey)
    .update(`${sessionId}:${nonce}`)
    .digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
