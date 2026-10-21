import 'server-only'
import * as OTPAuth from 'otpauth'

export function generateBase32Secret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32
}

export function createTotpUri(secretBase32: string, username: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: 'cv.lytex.dev',
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  })
  return totp.toString()
}

export function verifyTotp(secretBase32: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: 'cv.lytex.dev',
    label: 'admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  })
  return totp.validate({ token, window: 1 }) !== null
}
