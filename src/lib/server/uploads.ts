import 'server-only'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { getDataDir } from './data-dir'

const MAX_BYTES = 8 * 1024 * 1024
const MAX_WIDTH = 1600

const MAGIC: Array<{ mime: string; test: (buf: Buffer) => boolean }> = [
  {
    mime: 'image/jpeg',
    test: (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    mime: 'image/png',
    test: (buf) =>
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47,
  },
  {
    mime: 'image/webp',
    test: (buf) =>
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP',
  },
]

export async function processProjectImage(
  slug: string,
  filenameBase: string,
  input: Buffer,
): Promise<{ filename: string; relativePath: string }> {
  if (input.length > MAX_BYTES) {
    throw new Error('File too large')
  }

  const matched = MAGIC.find((m) => m.test(input))
  if (!matched) {
    throw new Error('Unsupported image type')
  }

  const outDir = path.join(getDataDir(), 'uploads', 'projects', slug)
  mkdirSync(outDir, { recursive: true })

  const filename = `${filenameBase}.webp`
  const outPath = path.join(outDir, filename)

  const processed = await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  writeFileSync(outPath, processed, { mode: 0o644 })

  return {
    filename,
    relativePath: path.join('uploads', 'projects', slug, filename),
  }
}

export function uploadedProjectImagePath(slug: string, filename: string): string {
  return path.join(getDataDir(), 'uploads', 'projects', slug, filename)
}

export async function processSiteImage(
  name: 'portrait' | 'logo',
  input: Buffer,
): Promise<string> {
  if (input.length > MAX_BYTES) {
    throw new Error('File too large')
  }
  const matched = MAGIC.find((m) => m.test(input))
  if (!matched) {
    throw new Error('Unsupported image type')
  }
  const outDir = path.join(getDataDir(), 'uploads', 'site')
  mkdirSync(outDir, { recursive: true })
  const filename = `${name}.webp`
  const outPath = path.join(outDir, filename)
  const width = name === 'logo' ? 512 : 1200
  const processed = await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer()
  writeFileSync(outPath, processed, { mode: 0o644 })
  return `/media/site/${filename}`
}

export async function processSitePdf(input: Buffer): Promise<string> {
  if (input.length > 12 * 1024 * 1024) {
    throw new Error('File too large')
  }
  if (input.slice(0, 4).toString('utf8') !== '%PDF') {
    throw new Error('Invalid PDF')
  }
  const outDir = path.join(getDataDir(), 'uploads', 'site')
  mkdirSync(outDir, { recursive: true })
  const filename = 'cv.pdf'
  writeFileSync(path.join(outDir, filename), input, { mode: 0o644 })
  return `/media/site/${filename}`
}
