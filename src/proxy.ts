import { NextRequest, NextResponse } from 'next/server'
import { parseIndexPublic, robotsTagForPath } from '@/lib/robots-policy'

const locales = new Set(['de', 'en'])
const passthroughRoots = new Set([
  'sudo',
  'admin',
  'wp-admin',
  'e',
  'media',
  'healthz',
  'api',
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

const DOCUMENT_CSP = [
  "default-src 'none'",
  "img-src 'self'",
  "object-src 'self'",
  "style-src 'unsafe-inline'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ')

function withSecurityHeaders(
  response: NextResponse,
  csp: string,
  pathname: string,
) {
  response.headers.set('Content-Security-Policy', csp)
  const robots = robotsTagForPath(pathname, parseIndexPublic(process.env.INDEX_PUBLIC))
  if (robots) {
    response.headers.set('X-Robots-Tag', robots)
  } else {
    response.headers.delete('X-Robots-Tag')
  }
  return response
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split('/')[1] ?? ''

  if (pathname === '/portrait.webp' || pathname.startsWith('/projects/')) {
    const url = request.nextUrl.clone()
    url.pathname =
      pathname === '/portrait.webp' ? '/media/portrait' : `/media${pathname}`
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const csp = buildCsp(nonce)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', csp)
    return withSecurityHeaders(
      NextResponse.rewrite(url, { request: { headers: requestHeaders } }),
      csp,
      url.pathname,
    )
  }

  if (pathname.startsWith('/media/documents/')) {
    return withSecurityHeaders(NextResponse.next(), DOCUMENT_CSP, pathname)
  }

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

  return withSecurityHeaders(response, csp, pathname)
}

export const config = {
  matcher: [
    {
      source:
        '/((?!_next|api|healthz|favicon.ico|icon.svg|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
