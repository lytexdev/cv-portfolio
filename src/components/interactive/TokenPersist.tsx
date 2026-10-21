'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const STORAGE_KEY = 'cv-access-token'

type Props = {
  locale: string
  knownToken?: string
}

export function TokenPersist({ locale, knownToken }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fromUrl = searchParams.get('k') || knownToken || null
    if (fromUrl) {
      try {
        sessionStorage.setItem(STORAGE_KEY, fromUrl)
      } catch {
        // ignore
      }
      return
    }

    let stored: string | null = null
    try {
      stored = sessionStorage.getItem(STORAGE_KEY)
    } catch {
      stored = null
    }
    if (!stored) return

    const next = new URLSearchParams(searchParams.toString())
    next.set('k', stored)
    const qs = next.toString()
    const target = `${pathname || `/${locale}`}${qs ? `?${qs}` : ''}`
    router.replace(target)
  }, [knownToken, locale, pathname, router, searchParams])

  return null
}

export function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function storeToken(token: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, token)
  } catch {
    // ignore
  }
}
