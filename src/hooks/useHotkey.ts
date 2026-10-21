'use client'

import { useEffect } from 'react'

type Options = {
  key: string
  ctrlOrMeta?: boolean
  enabled?: boolean
  handler: (event: KeyboardEvent) => void
}

export function useHotkey({ key, ctrlOrMeta = false, enabled = true, handler }: Options): void {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return
      if (ctrlOrMeta && !(event.metaKey || event.ctrlKey)) return
      if (!ctrlOrMeta && (event.metaKey || event.ctrlKey || event.altKey)) return
      event.preventDefault()
      handler(event)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, ctrlOrMeta, enabled, handler])
}
