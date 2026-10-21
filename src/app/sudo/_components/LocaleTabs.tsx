'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import styles from '../sudo.module.css'

type Props = {
  de: ReactNode
  en: ReactNode
  deLabel?: string
  enLabel?: string
}

export function LocaleTabs({
  de,
  en,
  deLabel = 'Deutsch',
  enLabel = 'English',
}: Props) {
  const [locale, setLocale] = useState<'de' | 'en'>('de')

  return (
    <div className={styles.localeTabs}>
      <div className={styles.tabList} role="tablist" aria-label="Locale">
        <button
          type="button"
          role="tab"
          aria-selected={locale === 'de'}
          className={`${styles.tab} ${locale === 'de' ? styles.tabActive : ''}`}
          onClick={() => setLocale('de')}
        >
          {deLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={locale === 'en'}
          className={`${styles.tab} ${locale === 'en' ? styles.tabActive : ''}`}
          onClick={() => setLocale('en')}
        >
          {enLabel}
        </button>
      </div>
      <div
        role="tabpanel"
        hidden={locale !== 'de'}
        className={styles.tabPanel}
      >
        {de}
      </div>
      <div
        role="tabpanel"
        hidden={locale !== 'en'}
        className={styles.tabPanel}
      >
        {en}
      </div>
    </div>
  )
}
