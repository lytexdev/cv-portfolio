'use client'

import { useEffect } from 'react'
import { useActiveSection } from '@/hooks/useActiveSection'

export function ActiveSection() {
  const active = useActiveSection()

  useEffect(() => {
    document.querySelectorAll('[data-section-link]').forEach((el) => {
      const id = el.getAttribute('data-section-link')
      if (id === active) {
        el.setAttribute('data-active', 'true')
      } else {
        el.removeAttribute('data-active')
      }
    })
  }, [active])

  return null
}
