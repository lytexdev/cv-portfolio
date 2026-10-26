'use client'

import { useId } from 'react'
import type { SpokenLanguageCode } from '@/content/types'
import { Tooltip } from '@/components/interactive/Tooltip'
import { LanguageFlag } from './LanguageFlag'
import styles from './LanguageFlags.module.css'

export type DisplayLanguage = {
  code: SpokenLanguageCode
  name: string
  level: string
}

type Props = {
  languages: DisplayLanguage[]
}

export function LanguageFlags({ languages }: Props) {
  const baseId = useId().replace(/:/g, '')

  return (
    <ul className={styles.list}>
      {languages.map((lang) => {
        const tip = `${lang.name} · ${lang.level}`
        return (
          <li key={lang.code}>
            <Tooltip label={tip}>
              <button type="button" className={styles.button} aria-label={tip}>
                <LanguageFlag code={lang.code} clipId={`${baseId}-${lang.code}`} />
              </button>
            </Tooltip>
          </li>
        )
      })}
    </ul>
  )
}
