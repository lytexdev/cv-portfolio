import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { getDataDir } from '@/lib/server/data-dir'
import { canAccessProtectedMedia } from '@/lib/server/media-auth'

type Params = { params: Promise<{ filename: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { filename } = await params
  if (!/^[a-z0-9._-]+$/i.test(filename)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const token = request.nextUrl.searchParams.get('k')
  if (!(await canAccessProtectedMedia(token))) {
    return new NextResponse('Not found', { status: 404 })
  }

  const absolute = path.join(getDataDir(), 'uploads', 'site', filename)
  if (!existsSync(absolute)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const buf = readFileSync(absolute)
  const ext = path.extname(filename).toLowerCase()
  const type =
    ext === '.png'
      ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.pdf'
          ? 'application/pdf'
          : 'image/webp'

  return new NextResponse(buf, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noimageindex',
    },
  })
}
