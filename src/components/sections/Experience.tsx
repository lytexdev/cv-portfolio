import type { CvDictionary, Locale } from '@/content/types'
import { Collapsible } from '@/components/content/Collapsible'
import { DocumentList } from '@/components/content/DocumentList'
import { RichText } from '@/components/content/RichText'
import { TechIcon } from '@/components/icons/TechIcon'
import { formatDuration, formatRange } from '@/lib/dates'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { getRuntimeExperiences } from '@/lib/server/content-db'
import { documentLinks } from '@/lib/server/documents'
import styles from './Experience.module.css'

type Props = {
  locale: Locale
  dictionary: CvDictionary
  accessToken?: string
}

export function Experience({ locale, dictionary, accessToken }: Props) {
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
                <h3>
                  <RichText text={copy.role} />
                </h3>
                <p className={styles.company}>
                  {entry.companyUrl ? (
                    <a
                      href={entry.companyUrl}
                      className={styles.companyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <RichText text={copy.company} />
                      <span className="visually-hidden"> {dictionary.externalNewTab}</span>
                    </a>
                  ) : (
                    <RichText text={copy.company} />
                  )}
                  {' · '}
                  <RichText text={copy.location} />
                </p>
                {Array.isArray(copy.highlights) && copy.highlights.length > 0 ? (
                  <Collapsible
                    showLabel={dictionary.collapse.show}
                    hideLabel={dictionary.collapse.hide}
                  >
                    <ul className={styles.highlights}>
                      {copy.highlights.map((item) => (
                        <li key={item}>
                          <RichText text={item} />
                        </li>
                      ))}
                    </ul>
                  </Collapsible>
                ) : null}
                <ul className={styles.stack}>
                  {entry.stack.map((techId) => (
                    <li key={techId} className={styles.chip}>
                      <TechIcon id={techId} showLabel />
                    </li>
                  ))}
                </ul>
                <DocumentList
                  documents={documentLinks({ type: 'experience', id: entry.id }, accessToken, locale)}
                  locale={locale}
                  labels={dictionary.documents}
                  externalNewTab={dictionary.externalNewTab}
                />
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
