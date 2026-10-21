import { NextRequest, NextResponse } from 'next/server'

const locales = new Set(['de', 'en'])
const passthroughRoots = new Set([
  'sudo',
  'admin',
  'wp-admin',
  'e',
  'media',
  'errors',
  'healthz',
  'api',
  'projects',
  'portrait.webp',
  'favicon.ico',
  'icon.svg',
  'robots.txt',
])

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`
  const styleSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-inline'`
    : `'self' 'nonce-${nonce}'`

  const csp = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src ${styleSrc};
    style-src-attr 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `

  return csp.replace(/\s{2,}/g, ' ').trim()
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split('/')[1] ?? ''

  if (
    firstSegment &&
    !locales.has(firstSegment) &&
    !passthroughRoots.has(firstSegment)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/de'
    return NextResponse.redirect(url, 307)
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    {
      source:
        '/((?!_next|api|healthz|projects|media|favicon.ico|icon.svg|robots.txt|portrait.webp|errors).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
