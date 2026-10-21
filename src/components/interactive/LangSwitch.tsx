'use client'

import Link from 'next/link'
import { useId } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Locale } from '@/content/types'
import { Tooltip } from './Tooltip'
import styles from './ControlButton.module.css'
import flagStyles from './LangSwitch.module.css'

type Props = {
  locale: Locale
  label: string
}

function FlagDe({ clipId }: { clipId: string }) {
  return (
    <svg className={flagStyles.flag} viewBox="0 0 16 16" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <circle cx="8" cy="8" r="8" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="16" height="5.34" y="0" fill="#000" />
        <rect width="16" height="5.34" y="5.33" fill="#dd0000" />
        <rect width="16" height="5.34" y="10.66" fill="#ffce00" />
      </g>
    </svg>
  )
}

function FlagEn({ clipId }: { clipId: string }) {
  return (
    <svg className={flagStyles.flag} viewBox="0 0 16 16" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <circle cx="8" cy="8" r="8" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="16" height="16" fill="#012169" />
        <path d="M0 0l16 16M16 0L0 16" stroke="#fff" strokeWidth="2.2" />
        <path d="M0 0l16 16M16 0L0 16" stroke="#C8102E" strokeWidth="1.1" />
        <path d="M8 0v16M0 8h16" stroke="#fff" strokeWidth="3.4" />
        <path d="M8 0v16M0 8h16" stroke="#C8102E" strokeWidth="2" />
      </g>
    </svg>
  )
}

export function LangSwitch({ locale, label }: Props) {
  const searchParams = useSearchParams()
  const clipId = useId().replace(/:/g, '')
  const token = searchParams.get('k')
  const next = locale === 'de' ? 'en' : 'de'
  const href = token ? `/${next}?k=${encodeURIComponent(token)}` : `/${next}`
  const tip = next === 'de' ? `${label}: Deutsch` : `${label}: English`

  return (
    <Tooltip label={tip}>
      <Link href={href} className={styles.button} hrefLang={next} aria-label={tip}>
        {next === 'de' ? <FlagDe clipId={clipId} /> : <FlagEn clipId={clipId} />}
      </Link>
    </Tooltip>
  )
}
