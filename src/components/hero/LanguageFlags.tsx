'use client'

import { useId } from 'react'
import { Tooltip } from '@/components/interactive/Tooltip'
import styles from './LanguageFlags.module.css'

type Language = {
  name: string
  level: string
  code?: 'de' | 'en'
}

type Props = {
  languages: Language[]
}

function resolveCode(lang: Language, index: number): 'de' | 'en' {
  if (lang.code === 'de' || lang.code === 'en') return lang.code
  const key = `${lang.name} ${lang.level}`.toLowerCase()
  if (key.includes('deutsch') || key.includes('german')) return 'de'
  if (key.includes('englisch') || key.includes('english')) return 'en'
  return index === 0 ? 'de' : 'en'
}

function FlagDe({ clipId }: { clipId: string }) {
  return (
    <svg className={styles.flag} viewBox="0 0 16 16" aria-hidden="true">
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
    <svg className={styles.flag} viewBox="0 0 16 16" aria-hidden="true">
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

export function LanguageFlags({ languages }: Props) {
  const baseId = useId().replace(/:/g, '')

  return (
    <ul className={styles.list}>
      {languages.map((lang, index) => {
        const code = resolveCode(lang, index)
        const tip = `${lang.name} · ${lang.level}`
        const clipId = `${baseId}-${code}-${index}`
        return (
          <li key={`${code}-${lang.name}`}>
            <Tooltip label={tip}>
              <button type="button" className={styles.button} aria-label={tip}>
                {code === 'de' ? <FlagDe clipId={clipId} /> : <FlagEn clipId={clipId} />}
              </button>
            </Tooltip>
          </li>
        )
      })}
    </ul>
  )
}
