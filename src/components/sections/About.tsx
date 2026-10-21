import type { CvDictionary, Locale } from '@/content/types'
import { Hero } from '@/components/hero/Hero'
import { SectionHeading } from '@/components/layout/SectionHeading'
import type { Viewer } from '@/lib/server/viewer'

type Props = {
  locale: Locale
  dictionary: CvDictionary
  viewer: Viewer
  age: number | null
  portraitSrc: string | null
}

export function About({ locale, dictionary, viewer, age, portraitSrc }: Props) {
  const section = dictionary.sections.whoami
  const languagesLabel = dictionary.more.languages
    .map((lang) => `${lang.name} (${lang.level})`)
    .join(', ')

  return (
    <section id="whoami" className="section" aria-labelledby="whoami-title">
      <SectionHeading id="whoami" rail={section.rail} title={section.title} />
      <Hero
        locale={locale}
        dictionary={dictionary}
        viewer={viewer}
        age={age}
        portraitSrc={portraitSrc}
        languagesLabel={languagesLabel}
      />
    </section>
  )
}
