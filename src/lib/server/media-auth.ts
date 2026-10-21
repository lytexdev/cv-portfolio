import 'server-only'
import { getAdminSession } from './session'
import { resolveViewer } from './viewer'

export async function canAccessProtectedMedia(
  token: string | null,
): Promise<boolean> {
  if (token) {
    const { viewer } = resolveViewer(token)
    if (viewer.kind === 'token') return true
  }

  const session = await getAdminSession()
  return Boolean(session)
}
