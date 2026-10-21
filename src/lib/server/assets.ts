import 'server-only'
import { existsSync } from 'node:fs'
import path from 'node:path'

const existenceCache = new Map<string, boolean>()

function publicExists(relativePath: string): boolean {
  const cached = existenceCache.get(relativePath)
  if (cached !== undefined) {
    return cached
  }
  const absolute = path.join(process.cwd(), 'public', relativePath)
  const exists = existsSync(absolute)
  existenceCache.set(relativePath, exists)
  return exists
}

export function projectImageExists(slug: string, filename: string): boolean {
  return publicExists(path.join('projects', slug, filename))
}

export function portraitExists(): boolean {
  return publicExists('portrait.webp')
}

export function projectImageSrc(slug: string, filename: string): string | null {
  if (!projectImageExists(slug, filename)) {
    return null
  }
  return `/projects/${slug}/${filename}`
}

export function portraitSrc(): string | null {
  return portraitExists() ? '/portrait.webp' : null
}
