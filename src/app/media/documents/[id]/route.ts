import { readFileSync } from 'node:fs'
import { NextRequest, NextResponse } from 'next/server'
import { writeAudit } from '@/lib/server/audit'
import { documentFilePath, getDocument } from '@/lib/server/documents'
import { resolveDocumentAccess } from '@/lib/server/media-auth'

type Params = { params: Promise<{ id: string }> }

function notFound() {
  return new NextResponse('Not found', {
    status: 404,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  })
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}

function contentDisposition(label: string, extension: string, download: boolean): string {
  const base = label.trim() || 'document'
  const ascii =
    base
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9._-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'document'
  const utf8 = encodeURIComponent(`${base}.${extension}`)
  return `${download ? 'attachment' : 'inline'}; filename="${ascii}.${extension}"; filename*=UTF-8''${utf8}`
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  const access = await resolveDocumentAccess(request.nextUrl.searchParams.get('k'))
  if (!access.allowed) return notFound()

  const document = getDocument(id)
  const absolute = document ? documentFilePath(document) : null
  if (!document || !absolute) return notFound()

  const download = request.nextUrl.searchParams.get('download') === '1'
  const label =
    request.nextUrl.searchParams.get('lang') === 'en' ? document.label.en : document.label.de
  writeAudit({
    category: 'viewer',
    event: download ? 'document_download' : 'document_view',
    detail: `${access.actor}: ${document.label.de}`,
    ip: clientIp(request),
  })

  const isPdf = document.kind === 'pdf'
  const body = readFileSync(absolute)
  return new NextResponse(body, {
    headers: {
      'Content-Type': isPdf ? 'application/pdf' : 'image/webp',
      'Content-Length': String(body.length),
      'Content-Disposition': contentDisposition(label, isPdf ? 'pdf' : 'webp', download),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noimageindex, noarchive',
      'Referrer-Policy': 'no-referrer',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  })
}
