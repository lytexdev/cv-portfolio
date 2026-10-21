'use client'

import { useEffect, useState } from 'react'
import { sectionOrder } from '@/content/shared'
import type { SectionId } from '@/content/types'

export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('whoami')

  useEffect(() => {
    const elements = sectionOrder
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (top?.target.id && sectionOrder.includes(top.target.id as SectionId)) {
          setActive(top.target.id as SectionId)
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    )

    for (const el of elements) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return active
}
