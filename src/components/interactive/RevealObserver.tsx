'use client'

import { useEffect } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function RevealObserver() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.classList.add('is-visible')
      })
      return
    }

    const elements = Array.from(document.querySelectorAll('[data-reveal]'))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    for (const el of elements) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [reduced])

  return null
}
