'use client'

import { useEffect, useState } from 'react'
import { sectionOrder } from '@/content/shared'
import type { SectionId } from '@/content/types'

function resolveActiveSection(): SectionId {
  const marker = window.innerHeight * 0.28
  let current: SectionId = sectionOrder[0] ?? 'whoami'

  for (const id of sectionOrder) {
    const el = document.getElementById(id)
    if (!el) continue
    if (el.getBoundingClientRect().top <= marker) {
      current = id
    }
  }

  return current
}

export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('whoami')

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      setActive(resolveActiveSection())
    }

    const onScrollOrResize = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [])

  return active
}
