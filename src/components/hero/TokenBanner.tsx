'use client'

import { IconX } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import styles from '@/components/sections/About.module.css'

type Props = {
  label: string
  role?: string | null
  badgeTemplate: string
  roleTemplate: string
  dismissLabel: string
}

export function TokenBanner({ label, role, badgeTemplate, roleTemplate, dismissLabel }: Props) {
  const [visible, setVisible] = useState(true)

  const dismiss = useCallback(() => {
    setVisible(false)
  }, [])

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
