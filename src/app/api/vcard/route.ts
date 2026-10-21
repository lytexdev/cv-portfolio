import { headers } from 'next/headers'
import { getEnv } from '@/lib/server/env'
import { detectAgent, logEvent } from '@/lib/server/log'
import { getPrivateData } from '@/lib/server/private-data'
import { resolveViewer } from '@/lib/server/viewer'

function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('k')
  const { viewer } = resolveViewer(token)

  if (viewer.kind !== 'token') {
    return new Response(null, { status: 404 })
  }

  const privateData = getPrivateData()
  if (!privateData) {
    return new Response(null, { status: 404 })
  }

  const env = getEnv()
  const requestHeaders = await headers()
  logEvent({
    evt: 'vcard_download',
    tokenId: viewer.id,
    lang: 'de',
    agent: detectAgent(requestHeaders.get('user-agent')),
  })

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVcard('Immanuel Mruk')}`,
    `N:${escapeVcard('Mruk')};${escapeVcard('Immanuel')};;;`,
    viewer.role ? `TITLE:${escapeVcard(viewer.role)}` : null,
    `EMAIL:${escapeVcard('immanuel@lytex.dev')}`,
    `TEL;TYPE=CELL:${escapeVcard(privateData.phone)}`,
    `ADR;TYPE=HOME:;;${escapeVcard(privateData.street)};${escapeVcard(privateData.city)};;${escapeVcard(privateData.postalCode)};${escapeVcard(privateData.country)}`,
    `URL:${escapeVcard(env.publicBaseUrl)}`,
    'END:VCARD',
  ].filter(Boolean)

  const body = `${lines.join('\r\n')}\r\n`

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="immanuel-mruk.vcf"',
      'Cache-Control': 'private, no-store',
    },
  })
}
