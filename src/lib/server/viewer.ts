import 'server-only'
import { findTokenByPlaintext, isValidTokenFormat } from './tokens'

export type Viewer =
  | { kind: 'public' }
  | { kind: 'expired'; id: string; label: string }
  | {
      kind: 'token'
      id: string
      label: string
      role?: string
      token: string
    }

export type ViewerResolveResult = {
  viewer: Viewer
  event: 'cv_view' | 'cv_view_expired' | 'cv_token_invalid' | null
}

export function resolveViewer(rawToken: string | undefined | null): ViewerResolveResult {
  if (!rawToken) {
    return { viewer: { kind: 'public' }, event: null }
  }

  if (!isValidTokenFormat(rawToken)) {
    return { viewer: { kind: 'public' }, event: 'cv_token_invalid' }
  }

  const entry = findTokenByPlaintext(rawToken)
  if (!entry || entry.revoked) {
    return { viewer: { kind: 'public' }, event: 'cv_token_invalid' }
  }

  if (entry.expiresAt) {
    const expires = Date.parse(entry.expiresAt)
    if (!Number.isNaN(expires) && expires < Date.now()) {
      return {
        viewer: { kind: 'expired', id: entry.id, label: entry.label },
        event: 'cv_view_expired',
      }
    }
  }

  return {
    viewer: {
      kind: 'token',
      id: entry.id,
      label: entry.label,
      role: entry.role,
      token: rawToken,
    },
    event: 'cv_view',
  }
}
