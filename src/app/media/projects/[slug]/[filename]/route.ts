import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { getDataDir } from '@/lib/server/data-dir'

type Params = { params: Promise<{ slug: string; filename: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug, filename } = await params
  if (!/^[a-z0-9-]+$/i.test(slug) || !/^[a-z0-9._-]+$/i.test(filename)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const filePath = path.join(getDataDir(), 'uploads', 'projects', slug, filename)
  if (!existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const buf = readFileSync(filePath)
  const ext = path.extname(filename).toLowerCase()
  const type =
    ext === '.webp'
      ? 'image/webp'
      : ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : 'application/octet-stream'

  return new NextResponse(buf, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
