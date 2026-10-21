'use client'

import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useState } from 'react'
import { useToast } from './Toaster'
import styles from './ControlButton.module.css'

type Props = {
  value: string
  label: string
  successMessage: string
}

export function CopyButton({ value, label, successMessage }: Props) {
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      showToast(successMessage)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
    }
  }

  return (
    <button type="button" className={styles.button} onClick={onCopy} aria-label={label}>
      {copied ? (
        <IconCheck size={18} stroke={1.75} aria-hidden="true" />
      ) : (
        <IconCopy size={18} stroke={1.75} aria-hidden="true" />
      )}
      <span>{label}</span>
    </button>
  )
}
