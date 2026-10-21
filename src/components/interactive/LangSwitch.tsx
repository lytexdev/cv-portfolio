'use client'

import Link from 'next/link'
import { IconLanguage } from '@tabler/icons-react'
import { useSearchParams } from 'next/navigation'
import type { Locale } from '@/content/types'
import styles from './ControlButton.module.css'

type Props = {
  locale: Locale
  label: string
}

export function LangSwitch({ locale, label }: Props) {
  const searchParams = useSearchParams()
  const token = searchParams.get('k')
  const next = locale === 'de' ? 'en' : 'de'
  const href = token ? `/${next}?k=${encodeURIComponent(token)}` : `/${next}`

  return (
    <Link href={href} className={styles.button} hrefLang={next} aria-label={label}>
      <IconLanguage size={20} stroke={1.75} aria-hidden="true" />
      <span>{next.toUpperCase()}</span>
    </Link>
  )
}
