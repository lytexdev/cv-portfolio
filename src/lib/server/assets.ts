import 'server-only'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { getDataDir } from './data-dir'

const existenceCache = new Map<string, boolean>()

function publicExists(relativePath: string): boolean {
  const cached = existenceCache.get(`public:${relativePath}`)
  if (cached !== undefined) {
    return cached
  }
  const absolute = path.join(process.cwd(), 'public', relativePath)
  const exists = existsSync(absolute)
  existenceCache.set(`public:${relativePath}`, exists)
  return exists
}

function uploadExists(slug: string, filename: string): boolean {
  const key = `upload:${slug}:${filename}`
  const cached = existenceCache.get(key)
  if (cached !== undefined) {
    return cached
  }
  const absolute = path.join(getDataDir(), 'uploads', 'projects', slug, filename)
  const exists = existsSync(absolute)
  existenceCache.set(key, exists)
  return exists
}

export function projectImageExists(slug: string, filename: string): boolean {
  return (
    uploadExists(slug, filename) ||
    publicExists(path.join('projects', slug, filename))
  )
}

export function portraitExists(): boolean {
  return publicExists('portrait.webp')
}

export function projectImageSrc(slug: string, filename: string): string | null {
  if (uploadExists(slug, filename)) {
    return `/media/projects/${slug}/${filename}`
  }
  if (publicExists(path.join('projects', slug, filename))) {
    return `/projects/${slug}/${filename}`
  }
  return null
}

export function portraitSrc(): string | null {
  return portraitExists() ? '/portrait.webp' : null
}
