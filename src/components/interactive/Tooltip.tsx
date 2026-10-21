'use client'

import type { ReactNode } from 'react'
import styles from './Tooltip.module.css'

type Props = {
  label: string
  children: ReactNode
}

export function Tooltip({ label, children }: Props) {
  return (
    <span className={styles.root} data-tooltip={label}>
      {children}
    </span>
  )
}
