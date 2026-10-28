import 'server-only'
import { getEnv } from './env'
import { getAdminSession } from './session'
import { resolveViewer } from './viewer'

export async function canAccessProtectedMedia(
  token: string | null,
): Promise<boolean> {
  if (!getEnv().requireToken) {
    return true
  }

  if (token) {
    const { viewer } = resolveViewer(token)
    if (viewer.kind === 'token') return true
  }

  const session = await getAdminSession()
  return Boolean(session)
}

export type DocumentAccess = { allowed: false } | { allowed: true; actor: string }

export async function resolveDocumentAccess(token: string | null): Promise<DocumentAccess> {
  if (token) {
    const { viewer } = resolveViewer(token)
    if (viewer.kind === 'token') return { allowed: true, actor: viewer.label }
  }
  const session = await getAdminSession()
  return session ? { allowed: true, actor: 'admin' } : { allowed: false }
}
