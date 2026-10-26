import type { CvDictionary } from '@/content/types'
import { Hero } from '@/components/hero/Hero'
import { TokenBanner } from '@/components/hero/TokenBanner'
import { SectionHeading } from '@/components/layout/SectionHeading'
import type { Viewer } from '@/lib/server/viewer'

type Props = {
  dictionary: CvDictionary
  viewer: Viewer
  age: number | null
  portraitSrc: string | null
  personName: string
  personCity: string
  personMonogram: string
  github?: string
  linkedin?: string
}

export function About({
  dictionary,
  viewer,
  age,
  portraitSrc,
  personName,
  personCity,
  personMonogram,
  github,
  linkedin,
}: Props) {
  const section = dictionary.sections.whoami
  const languages = Array.isArray(dictionary.more.languages) ? dictionary.more.languages : []

  return (
    <section id="whoami" className="section" aria-labelledby="whoami-title">
      {viewer.kind === 'token' ? (
        <TokenBanner
          label={viewer.label}
          role={viewer.role}
          badgeTemplate={dictionary.hero.tokenBadge}
          roleTemplate={dictionary.hero.tokenRole}
          dismissLabel={dictionary.hero.tokenDismiss}
        />
      ) : null}
      <SectionHeading id="whoami" rail={section.rail} title={section.title} />
      <Hero
        dictionary={dictionary}
        age={age}
        portraitSrc={portraitSrc}
        languages={languages}
        personName={personName}
        personCity={personCity}
        personMonogram={personMonogram}
        github={github}
        linkedin={linkedin}
      />
    </section>
  )
}
