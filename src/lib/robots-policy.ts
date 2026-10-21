export function parseIndexPublic(value: string | undefined): boolean {
  if (value === undefined || value === '') return false
  const v = value.trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes' || v === 'on'
}

export function isAlwaysNoIndexPath(pathname: string): boolean {
  return (
    pathname.startsWith('/sudo') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/wp-admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/media') ||
    pathname.startsWith('/e/')
  )
}

export const NOINDEX_ROBOTS_TAG =
  'noindex, nofollow, noarchive, nosnippet, noimageindex'

export function robotsTagForPath(
  pathname: string,
  indexPublic: boolean,
): string | null {
  if (!indexPublic || isAlwaysNoIndexPath(pathname)) {
    return NOINDEX_ROBOTS_TAG
  }
  return null
}
