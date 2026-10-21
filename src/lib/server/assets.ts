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

export function withAccessToken(src: string, token?: string): string {
  if (!token) return src
  const join = src.includes('?') ? '&' : '?'
  return `${src}${join}k=${encodeURIComponent(token)}`
}

export function projectImageSrc(
  slug: string,
  filename: string,
  token?: string,
): string | null {
  if (uploadExists(slug, filename) || publicExists(path.join('projects', slug, filename))) {
    return withAccessToken(`/media/projects/${slug}/${filename}`, token)
  }
  return null
}

export function portraitSrc(token?: string): string | null {
  if (!portraitExists()) return null
  return withAccessToken('/media/portrait', token)
}

export function resolveProjectImagePath(
  slug: string,
  filename: string,
): { absolute: string; contentType: string } | null {
  const uploadPath = path.join(getDataDir(), 'uploads', 'projects', slug, filename)
  const publicPath = path.join(process.cwd(), 'public', 'projects', slug, filename)
  const absolute = existsSync(uploadPath)
    ? uploadPath
    : existsSync(publicPath)
      ? publicPath
      : null
  if (!absolute) return null
  const ext = path.extname(filename).toLowerCase()
  const contentType =
    ext === '.webp'
      ? 'image/webp'
      : ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : 'application/octet-stream'
  return { absolute, contentType }
}
