import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconPrinter,
} from '@tabler/icons-react'
import Image from 'next/image'
import { person, projectCount } from '@/content/shared'
import type { CvDictionary, Locale } from '@/content/types'
import type { Viewer } from '@/lib/server/viewer'
import { BootTerminal } from './BootTerminal'
import styles from './Hero.module.css'

type Props = {
  locale: Locale
  dictionary: CvDictionary
  viewer: Viewer
  age: number | null
  portraitSrc: string | null
  languagesLabel: string
}

export function Hero({
  locale,
  dictionary,
  viewer,
  age,
  portraitSrc,
  languagesLabel,
}: Props) {
  return (
    <div className={styles.root}>
      <div>
        {viewer.kind === 'token' ? (
          <div className={styles.badge}>
            <strong>
              {dictionary.hero.tokenBadge.replace('{label}', viewer.label)}
            </strong>
            {viewer.role ? (
              <span className={styles.badgeRole}>
                {dictionary.hero.tokenRole.replace('{role}', viewer.role)}
              </span>
            ) : null}
          </div>
        ) : null}

        <p className={`mono-label ${styles.prompt}`}>{dictionary.hero.prompt}</p>
        <div className={`boot-slot ${styles.bootSlot}`} aria-hidden="true">
          <BootTerminal />
        </div>

        <h1 className={styles.name}>{person.name}</h1>
        <p className={styles.role}>{dictionary.role}</p>
        <p className={styles.summary}>{dictionary.summary}</p>

        <div className={styles.actions}>
          <a href={`/${locale}#contact`} className={styles.primary}>
            {dictionary.hero.ctaContact}
          </a>
          <button type="button" className={styles.secondary} data-print-trigger>
            <IconPrinter size={18} stroke={1.75} aria-hidden="true" />
            {dictionary.hero.ctaPrint}
          </button>
          <a
            href={person.github}
            className={styles.iconLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`GitHub ${dictionary.externalNewTab}`}
          >
            <IconBrandGithub size={20} stroke={1.75} aria-hidden="true" />
          </a>
          <a
            href={person.linkedin}
            className={styles.iconLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`LinkedIn ${dictionary.externalNewTab}`}
          >
            <IconBrandLinkedin size={20} stroke={1.75} aria-hidden="true" />
          </a>
        </div>

        <div className={styles.metrics}>
          <div>
            <p className={styles.metricValue}>2022</p>
            <p className={styles.metricLabel}>{dictionary.hero.metricSince}</p>
          </div>
          <div>
            <p className={styles.metricValue}>{projectCount}</p>
            <p className={styles.metricLabel}>
              {dictionary.hero.metricProjects.replace('{n}', String(projectCount))}
            </p>
          </div>
        </div>
      </div>

      <aside className={styles.aside}>
        <div className={styles.portrait}>
          {portraitSrc ? (
            <Image
              src={portraitSrc}
              alt={person.name}
              fill
              sizes="(max-width: 1023px) 100vw, 360px"
              className={styles.portraitImg}
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className={styles.monogram}>{person.monogram}</div>
          )}
        </div>

        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt className={`mono-label ${styles.metaKey}`}>
              {dictionary.hero.metaLocation}
            </dt>
            <dd className={styles.metaValue}>{person.city}</dd>
          </div>
          {age !== null ? (
            <div className={styles.metaRow}>
              <dt className={`mono-label ${styles.metaKey}`}>
                {dictionary.hero.metaAge}
              </dt>
              <dd className={styles.metaValue}>
                {dictionary.hero.ageYears.replace('{n}', String(age))}
              </dd>
            </div>
          ) : null}
          <div className={styles.metaRow}>
            <dt className={`mono-label ${styles.metaKey}`}>
              {dictionary.hero.metaLanguages}
            </dt>
            <dd className={styles.metaValue}>{languagesLabel}</dd>
          </div>
          {dictionary.availability ? (
            <div className={styles.metaRow}>
              <dt className={`mono-label ${styles.metaKey}`}>
                {dictionary.hero.metaAvailability}
              </dt>
              <dd className={styles.metaValue}>{dictionary.availability}</dd>
            </div>
          ) : null}
        </dl>
      </aside>
    </div>
  )
}
