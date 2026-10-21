import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getEnv } from './env'

export const ADMIN_COOKIE = 'cv_admin_session'
const IDLE_MS = 1000 * 60 * 60 * 2
const ABSOLUTE_MS = 1000 * 60 * 60 * 12

export type AdminSession = {
  adminId: number
  username: string
  mustChange: boolean
  iat: number
  lastActive: number
}

function secretKey() {
  return new TextEncoder().encode(getEnv().secretKey)
}

export async function createSessionToken(payload: {
  adminId: number
  username: string
  mustChange: boolean
}): Promise<string> {
  const now = Date.now()
  return new SignJWT({
    adminId: payload.adminId,
    username: payload.username,
    mustChange: payload.mustChange,
    lastActive: now,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(now / 1000))
    .setExpirationTime(Math.floor((now + ABSOLUTE_MS) / 1000))
    .sign(secretKey())
}

export async function readSessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    const adminId = Number(payload.adminId)
    const username = String(payload.username ?? '')
    const mustChange = Boolean(payload.mustChange)
    const iat = Number(payload.iat ?? 0) * 1000
    const lastActive = Number(payload.lastActive ?? iat)
    const now = Date.now()

    if (!adminId || !username) return null
    if (now - lastActive > IDLE_MS) return null
    if (now - iat > ABSOLUTE_MS) return null

    return { adminId, username, mustChange, iat, lastActive }
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies()
  const raw = jar.get(ADMIN_COOKIE)?.value
  if (!raw) return null
  return readSessionToken(raw)
}

export async function setAdminSessionCookie(token: string) {
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: getEnv().isProduction,
    sameSite: 'strict',
    path: '/sudo',
    maxAge: ABSOLUTE_MS / 1000,
  })
}

export async function clearAdminSessionCookie() {
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: getEnv().isProduction,
    sameSite: 'strict',
    path: '/sudo',
    maxAge: 0,
  })
}

export async function touchSession(session: AdminSession): Promise<string> {
  return createSessionToken({
    adminId: session.adminId,
    username: session.username,
    mustChange: session.mustChange,
  })
}
