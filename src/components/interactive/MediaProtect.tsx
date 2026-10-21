'use client'

import { useEffect } from 'react'

export function MediaProtect() {
  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      if (target.closest('img, svg, picture, video, [data-protect-media]')) {
        event.preventDefault()
      }
    }

    document.addEventListener('contextmenu', onContextMenu)
    return () => document.removeEventListener('contextmenu', onContextMenu)
  }, [])

  return null
}
