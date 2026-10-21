'use client'

import { useState } from 'react'
import styles from '../sudo.module.css'

type Props = {
  token: string | null
  link: string | null
}

export function CopyTokenButton({ token, link }: Props) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'missing'>('idle')

  if (!token) {
    return (
      <button
        type="button"
        className={styles.buttonGhost}
        disabled
        title="Token was created before recoverable storage. Create a new token."
      >
        Not recoverable
      </button>
    )
  }

  return (
    <div className={styles.tokenActions}>
      <button
        type="button"
        className={styles.button}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(token)
            setStatus('copied')
            window.setTimeout(() => setStatus('idle'), 1600)
          } catch {
            setStatus('missing')
          }
        }}
      >
        {status === 'copied' ? 'Copied token' : 'Copy token'}
      </button>
      {link ? (
        <button
          type="button"
          className={styles.buttonGhost}
          onClick={async () => {
            await navigator.clipboard.writeText(link)
            setStatus('copied')
            window.setTimeout(() => setStatus('idle'), 1600)
          }}
        >
          Copy link
        </button>
      ) : null}
    </div>
  )
}
