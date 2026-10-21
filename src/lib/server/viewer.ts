import 'server-only'
import { findTokenByPlaintext, isValidTokenFormat } from './tokens'

export type Viewer =
  | { kind: 'gate'; reason: 'missing' | 'invalid' | 'revoked' }
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
  event: 'cv_view' | 'cv_view_expired' | 'cv_token_invalid' | 'cv_token_missing' | null
}

export function resolveViewer(rawToken: string | undefined | null): ViewerResolveResult {
  if (!rawToken) {
    return { viewer: { kind: 'gate', reason: 'missing' }, event: 'cv_token_missing' }
  }

  if (!isValidTokenFormat(rawToken)) {
    return { viewer: { kind: 'gate', reason: 'invalid' }, event: 'cv_token_invalid' }
  }

  const entry = findTokenByPlaintext(rawToken)
  if (!entry) {
    return { viewer: { kind: 'gate', reason: 'invalid' }, event: 'cv_token_invalid' }
  }
  if (entry.revoked) {
    return { viewer: { kind: 'gate', reason: 'revoked' }, event: 'cv_token_invalid' }
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
