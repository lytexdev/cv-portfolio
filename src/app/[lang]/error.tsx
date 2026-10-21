'use client'

import { useEffect } from 'react'
import styles from './error.module.css'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className={styles.root}>
      <h2>Something went wrong</h2>
      <button type="button" onClick={reset} className={styles.button}>
        Try again
      </button>
    </main>
  )
}
