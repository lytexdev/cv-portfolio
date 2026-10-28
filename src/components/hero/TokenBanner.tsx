'use client'

import { IconX } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import styles from '@/components/sections/About.module.css'

type Props = {
  label: string
  role?: string | null
  badgeTemplate: string
  roleTemplate: string
  dismissLabel: string
}

function storageKey(label: string) {
  return `cv-token-banner-dismissed:${label}`
}

export function TokenBanner({ label, role, badgeTemplate, roleTemplate, dismissLabel }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey(label)) === '1') {
        setVisible(false)
        return
      }
    } catch {
    }
    setVisible(true)
  }, [label])

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(storageKey(label), '1')
    } catch {
    }
    setVisible(false)
  }, [label])

  if (!visible) return null

  return (
    <div className={styles.tokenBanner}>
      <div className={styles.tokenBannerBody}>
        <strong>{badgeTemplate.replace('{label}', label)}</strong>
        {role ? (
          <span className={styles.tokenRole}>{roleTemplate.replace('{role}', role)}</span>
        ) : null}
      </div>
      <button
        type="button"
        className={styles.tokenDismiss}
        onClick={dismiss}
        aria-label={dismissLabel}
      >
        <IconX size={18} stroke={1.75} aria-hidden="true" />
      </button>
    </div>
  )
}
