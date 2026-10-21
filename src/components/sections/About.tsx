import type { CvDictionary } from '@/content/types'
import { Hero } from '@/components/hero/Hero'
import { SectionHeading } from '@/components/layout/SectionHeading'
import type { Viewer } from '@/lib/server/viewer'
import styles from './About.module.css'

type Props = {
  dictionary: CvDictionary
  viewer: Viewer
  age: number | null
  portraitSrc: string | null
  personName: string
  personCity: string
  personMonogram: string
  softwareSinceYear: number
}

export function About({
  dictionary,
  viewer,
  age,
  portraitSrc,
  personName,
  personCity,
  personMonogram,
  softwareSinceYear,
}: Props) {
  const section = dictionary.sections.whoami
  const languagesLabel = Array.isArray(dictionary.more.languages)
    ? dictionary.more.languages
        .map((lang) => `${lang.name} (${lang.level})`)
        .join(', ')
    : ''

  return (
    <section id="whoami" className="section" aria-labelledby="whoami-title">
      {viewer.kind === 'token' ? (
        <div className={styles.tokenBanner}>
          <strong>
            {dictionary.hero.tokenBadge.replace('{label}', viewer.label)}
          </strong>
          {viewer.role ? (
            <span className={styles.tokenRole}>
              {dictionary.hero.tokenRole.replace('{role}', viewer.role)}
            </span>
          ) : null}
        </div>
      ) : null}
      <SectionHeading id="whoami" rail={section.rail} title={section.title} />
      <Hero
        dictionary={dictionary}
        age={age}
        portraitSrc={portraitSrc}
        languagesLabel={languagesLabel}
        personName={personName}
        personCity={personCity}
        personMonogram={personMonogram}
        softwareSinceYear={softwareSinceYear}
      />
    </section>
  )
}
