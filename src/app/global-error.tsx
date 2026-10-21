'use client'

import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="de" data-theme="dark">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#0B0E14',
          color: '#E6EAF2',
        }}
      >
        <main style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Something went wrong</h1>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1rem',
              minHeight: 44,
              padding: '0.5rem 1rem',
              border: '1px solid #626E84',
              borderRadius: 4,
              background: '#11151D',
              color: '#E6EAF2',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
