'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/content/types'
import { storeToken, readStoredToken } from '@/components/interactive/TokenPersist'
import styles from './TokenGate.module.css'

type Props = {
  locale: Locale
  reason: 'missing' | 'invalid' | 'revoked' | 'expired'
  label?: string
}

const copy = {
  de: {
    title: 'Zugriff geschützt',
    missing: 'Für diese Seite wird ein gültiger Zugangstoken benötigt.',
    invalid: 'Der angegebene Token ist ungültig.',
    revoked: 'Dieser Token wurde widerrufen.',
    expired: 'Dieser Token ist abgelaufen.',
    label: 'Zugangstoken',
    submit: 'Lebenslauf öffnen',
    hint: 'Token aus dem Einladungslink einfügen.',
  },
  en: {
    title: 'Access locked',
    missing: 'A valid access token is required to view this CV.',
    invalid: 'The provided token is invalid.',
    revoked: 'This token has been revoked.',
    expired: 'This token has expired.',
    label: 'Access token',
    submit: 'Open CV',
    hint: 'Paste the token from your invitation link.',
  },
} as const

export function TokenGate({ locale, reason, label }: Props) {
  const t = copy[locale]
  const router = useRouter()
  const [value, setValue] = useState('')
  const message =
    reason === 'expired' && label ? `${t.expired} (${label})` : t[reason]

  useEffect(() => {
    if (reason !== 'missing') return
    const stored = readStoredToken()
    if (!stored) return
    router.replace(`/${locale}?k=${encodeURIComponent(stored)}`)
  }, [locale, reason, router])

  return (
    <main className={styles.root} id="main">
      <p className={`mono-label ${styles.prompt}`}>immanuel@lytex ~&gt; unlock</p>
      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.message}>{message}</p>
      <p className={styles.hint}>{t.hint}</p>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          const token = value.trim()
          if (!token) return
          storeToken(token)
          router.push(`/${locale}?k=${encodeURIComponent(token)}`)
        }}
      >
        <label className={styles.label} htmlFor="token-input">
          {t.label}
        </label>
        <input
          id="token-input"
          className={styles.input}
          name="k"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          required
          minLength={32}
          maxLength={64}
          pattern="[A-Za-z0-9_\-]{32,64}"
        />
        <button type="submit" className={styles.button}>
          {t.submit}
        </button>
      </form>
    </main>
  )
}
