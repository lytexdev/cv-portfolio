import 'server-only'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { getEnv } from './env'

function keyBytes() {
  return createHash('sha256').update(getEnv().secretKey, 'utf8').digest()
}

export function sealSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyBytes(), iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return [
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.')
}

export function unsealSecret(sealed: string): string | null {
  const [ivPart, tagPart, dataPart] = sealed.split('.')
  if (!ivPart || !tagPart || !dataPart) return null
  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      keyBytes(),
      Buffer.from(ivPart, 'base64url'),
    )
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))
    const plain = Buffer.concat([
      decipher.update(Buffer.from(dataPart, 'base64url')),
      decipher.final(),
    ])
    return plain.toString('utf8')
  } catch {
    return null
  }
}
