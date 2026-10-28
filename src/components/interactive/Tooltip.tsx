'use client'

import type { ReactNode } from 'react'
import styles from './Tooltip.module.css'

type Props = {
  label: string
  placement?: 'top' | 'end'
  children: ReactNode
}

export function Tooltip({ label, placement = 'top', children }: Props) {
  return (
    <span
      className={`${styles.root} ${placement === 'end' ? styles.end : ''}`}
      data-tooltip={label}
    >
      {children}
    </span>
  )
}
