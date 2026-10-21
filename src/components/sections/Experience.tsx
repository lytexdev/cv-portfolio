import type { CvDictionary, Locale } from '@/content/types'
import { RichText } from '@/components/content/RichText'
import { TechIcon } from '@/components/icons/TechIcon'
import { formatDuration, formatRange } from '@/lib/dates'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { getRuntimeExperiences } from '@/lib/server/content-db'
import styles from './Experience.module.css'

type Props = {
  locale: Locale
  dictionary: CvDictionary
}

export function Experience({ locale, dictionary }: Props) {
  const section = dictionary.sections.experience
  const experiences = getRuntimeExperiences()

  return (
    <section
      id="experience"
      className="section"
      aria-labelledby="experience-title"
      data-reveal
    >
      <SectionHeading id="experience" rail={section.rail} title={section.title} />
      <ol className={styles.list}>
        {experiences.map((entry) => {
          const copy = dictionary.experience.entries[
            entry.id as keyof typeof dictionary.experience.entries
          ]
          if (!copy) return null
          const current = entry.end === null
          return (
            <li
              key={entry.id}
              className={`${styles.item} ${current ? styles.itemCurrent : ''}`}
            >
              <div className={styles.when}>
                <p className={`mono-label ${styles.range}`}>
                  {formatRange(entry.start, entry.end, locale, dictionary)}
                </p>
                <p className={styles.duration}>
                  {formatDuration(entry.start, entry.end, dictionary)}
                </p>
              </div>
              <div>
                <h3>{copy.role}</h3>
                <p className={styles.company}>
                  {copy.company} · {copy.location}
                </p>
                {Array.isArray(copy.highlights) && copy.highlights.length > 0 ? (
                  <ul className={styles.highlights}>
                    {copy.highlights.map((item) => (
                      <li key={item}>
                        <RichText text={item} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                <ul className={styles.stack}>
                  {entry.stack.map((techId) => (
                    <li key={techId} className={styles.chip}>
                      <TechIcon id={techId} showLabel />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
