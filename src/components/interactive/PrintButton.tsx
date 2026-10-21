'use client'

import { IconPrinter } from '@tabler/icons-react'
import styles from './ControlButton.module.css'

type Props = {
  label: string
}

export function PrintButton({ label }: Props) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => window.print()}
      aria-label={label}
    >
      <IconPrinter size={18} stroke={1.75} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
