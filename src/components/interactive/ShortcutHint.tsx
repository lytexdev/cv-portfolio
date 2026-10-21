'use client'

import { IconCommand } from '@tabler/icons-react'
import { useSyncExternalStore } from 'react'
import styles from './ShortcutHint.module.css'

function subscribe() {
  return () => {}
}

function getIsMac(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /Mac/.test(navigator.userAgent)
}

function getMounted(): boolean {
  return true
}

export function ShortcutHint() {
  const mounted = useSyncExternalStore(subscribe, getMounted, () => false)
  const isMac = useSyncExternalStore(subscribe, getIsMac, () => false)

  if (!mounted) {
    return <span className={styles.root} aria-hidden="true" />
  }

  if (isMac) {
    return (
      <span className={styles.root} aria-hidden="true">
        <IconCommand size={12} stroke={1.75} />
        <span>K</span>
      </span>
    )
  }

  return (
    <span className={styles.root} aria-hidden="true">
      Ctrl K
    </span>
  )
}
