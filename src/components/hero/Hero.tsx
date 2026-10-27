import { IconBrandGithub, IconBrandLinkedin, IconPrinter } from '@tabler/icons-react'
import Image from 'next/image'
import type { CvDictionary } from '@/content/types'
import { RichText } from '@/components/content/RichText'
import { LanguageFlags, type DisplayLanguage } from '@/components/hero/LanguageFlags'
import { Tooltip } from '@/components/interactive/Tooltip'
import styles from './Hero.module.css'

type Props = {
  dictionary: CvDictionary
  age: number | null
  portraitSrc: string | null
  languages: DisplayLanguage[]
  personName: string
  personCity: string
  personMonogram: string
  github?: string
  linkedin?: string
}

export function Hero({
  dictionary,
  age,
  portraitSrc,
  languages,
  personName,
  personCity,
  personMonogram,
  github = 'https://github.com/lytexdev',
  linkedin = 'https://www.linkedin.com/in/immanuel-mruk-775958372/',
}: Props) {
  return (
    <div className={styles.root}>
      <div>
        <p className={`mono-label ${styles.prompt}`} data-boot-step="type">{dictionary.hero.prompt}</p>

        <h1 className={styles.name} data-boot-step="1">{personName}</h1>
        <p className={styles.role} data-boot-step="2">
          <RichText text={dictionary.role} />
        </p>
        <p className={styles.summary} data-boot-step="3">
          <RichText text={dictionary.summary} />
        </p>

        <div className={styles.actions} data-boot-step="4">
          <button type="button" className={styles.secondary} data-print-trigger>
            <IconPrinter size={18} stroke={1.75} aria-hidden="true" />
            {dictionary.hero.ctaPrint}
          </button>
          <Tooltip label={`GitHub ${dictionary.externalNewTab}`}>
            <a
              href={github}
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub ${dictionary.externalNewTab}`}
            >
              <IconBrandGithub size={20} stroke={1.75} aria-hidden="true" />
            </a>
          </Tooltip>
          <Tooltip label={`LinkedIn ${dictionary.externalNewTab}`}>
            <a
              href={linkedin}
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn ${dictionary.externalNewTab}`}
            >
              <IconBrandLinkedin size={20} stroke={1.75} aria-hidden="true" />
            </a>
          </Tooltip>
        </div>
      </div>

      <aside className={styles.aside}>
        <div className={styles.portrait} data-protect-media data-boot-step="5">
          {portraitSrc ? (
            <Image
              key={portraitSrc}
              src={portraitSrc}
              alt={personName}
              fill
              sizes="(max-width: 1023px) 100vw, 360px"
              className={styles.portraitImg}
              loading="eager"
              fetchPriority="high"
              unoptimized
              draggable={false}
            />
          ) : (
            <div className={styles.monogram}>{personMonogram}</div>
          )}
        </div>

        <dl className={styles.meta} data-boot-step="6">
          <div className={styles.metaRow}>
            <dt className={`mono-label ${styles.metaKey}`}>{dictionary.hero.metaLocation}</dt>
            <dd className={styles.metaValue}>{personCity}</dd>
          </div>
          {age !== null ? (
            <div className={styles.metaRow}>
              <dt className={`mono-label ${styles.metaKey}`}>{dictionary.hero.metaAge}</dt>
              <dd className={styles.metaValue}>
                {dictionary.hero.ageYears.replace('{n}', String(age))}
              </dd>
            </div>
          ) : null}
          {languages.length > 0 ? (
            <div className={styles.metaRow}>
              <dt className={`mono-label ${styles.metaKey}`}>{dictionary.hero.metaLanguages}</dt>
              <dd className={styles.metaValue}>
                <LanguageFlags languages={languages} />
              </dd>
            </div>
          ) : null}
          {dictionary.availability ? (
            <div className={styles.metaRow}>
              <dt className={`mono-label ${styles.metaKey}`}>{dictionary.hero.metaAvailability}</dt>
              <dd className={styles.metaValue}>
                <RichText text={dictionary.availability} />
              </dd>
            </div>
          ) : null}
        </dl>
      </aside>
    </div>
  )
}
