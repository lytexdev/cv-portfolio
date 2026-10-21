import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { getDataDir } from '@/lib/server/data-dir'
import { canAccessProtectedMedia } from '@/lib/server/media-auth'
import { getSiteProfile } from '@/lib/server/settings'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('k')
  if (!(await canAccessProtectedMedia(token))) {
    return new NextResponse('Not found', { status: 404 })
  }

  const profile = getSiteProfile()
  const candidates: string[] = []

  if (profile.portraitPath) {
    if (profile.portraitPath.startsWith('/media/site/')) {
      const filename = profile.portraitPath.replace('/media/site/', '').split('?')[0] ?? ''
      if (filename) {
        candidates.push(path.join(getDataDir(), 'uploads', 'site', filename))
      }
    }
  }

  candidates.push(path.join(getDataDir(), 'uploads', 'site', 'portrait.webp'))
  candidates.push(path.join(process.cwd(), 'public', 'portrait.webp'))

  const absolute = candidates.find((candidate) => existsSync(candidate))
  if (!absolute) {
    return new NextResponse('Not found', { status: 404 })
  }

  const buf = readFileSync(absolute)
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noimageindex',
    },
  })
}
