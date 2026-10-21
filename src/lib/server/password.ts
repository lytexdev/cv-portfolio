import 'server-only'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const KEYLEN = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$')
  const algo = parts[0]
  const saltPart = parts[1]
  const hashPart = parts[2]
  if (parts.length !== 3 || algo !== 'scrypt' || !saltPart || !hashPart) {
    return false
  }
  const salt = Buffer.from(saltPart, 'base64url')
  const expected = Buffer.from(hashPart, 'base64url')
  const actual = scryptSync(password, salt, expected.length, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })
  if (actual.length !== expected.length) {
    return false
  }
  return timingSafeEqual(actual, expected)
}

export function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}
