import { readFileSync } from 'node:fs'
import { NextRequest, NextResponse } from 'next/server'
import { resolveProjectImagePath } from '@/lib/server/assets'
import { canAccessProtectedMedia } from '@/lib/server/media-auth'

type Params = { params: Promise<{ slug: string; filename: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { slug, filename } = await params
  if (!/^[a-z0-9-]+$/i.test(slug) || !/^[a-z0-9._-]+$/i.test(filename)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const token = request.nextUrl.searchParams.get('k')
  if (!(await canAccessProtectedMedia(token))) {
    return new NextResponse('Not found', { status: 404 })
  }

  const resolved = resolveProjectImagePath(slug, filename)
  if (!resolved) {
    return new NextResponse('Not found', { status: 404 })
  }

  const buf = readFileSync(resolved.absolute)
  return new NextResponse(buf, {
    headers: {
      'Content-Type': resolved.contentType,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noimageindex',
    },
  })
}
