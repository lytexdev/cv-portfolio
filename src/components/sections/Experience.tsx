import { IconDownload, IconEye, IconFileTypePdf, IconPhoto } from '@tabler/icons-react'
import type { CvDictionary, Locale } from '@/content/types'
import { Collapsible } from '@/components/content/Collapsible'
import { RichText } from '@/components/content/RichText'
import { TechIcon } from '@/components/icons/TechIcon'
import { formatDuration, formatRange } from '@/lib/dates'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { getRuntimeExperiences } from '@/lib/server/content-db'
import type { ExperienceDocument } from '@/lib/server/documents'
import styles from './Experience.module.css'

type Props = {
  locale: Locale
  dictionary: CvDictionary
  documents?: Record<string, ExperienceDocument[]>
  accessToken?: string
}

function formatSize(bytes: number, locale: Locale): string {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  return bytes >= 1024 * 1024
    ? `${formatter.format(bytes / 1024 / 1024)} MB`
    : `${formatter.format(Math.max(1, Math.round(bytes / 1024)))} KB`
}

export function Experience({ locale, dictionary, documents = {}, accessToken }: Props) {
  const labels = dictionary.experience.documents
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
                {accessToken && (documents[entry.id]?.length ?? 0) > 0 ? (
                  <div className={`no-print ${styles.documents}`}>
                    <p className={`mono-label ${styles.documentsTitle}`}>{labels.title}</p>
                    <ul className={styles.documentList}>
                      {(documents[entry.id] ?? []).map((document) => {
                        const href = `/media/documents/${document.id}?k=${encodeURIComponent(accessToken)}&lang=${locale}`
                        const name = document.label[locale]
                        const Icon = document.kind === 'pdf' ? IconFileTypePdf : IconPhoto
                        return (
                          <li key={document.id} className={styles.document}>
                            <span className={styles.documentName}>
                              <Icon size={20} stroke={1.75} aria-hidden="true" />
                              <span>
                                {name}
                                <span className={styles.documentMeta}>
                                  {document.kind === 'pdf' ? labels.pdf : labels.image} ·{' '}
                                  {formatSize(document.size, locale)}
                                </span>
                              </span>
                            </span>
                            <span className={styles.documentActions}>
                              <a
                                href={href}
                                className={styles.documentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconEye size={16} stroke={1.75} aria-hidden="true" />
                                {labels.view}
                                <span className="visually-hidden">
                                  : {name} {dictionary.externalNewTab}
                                </span>
                              </a>
                              <a
                                href={`${href}&download=1`}
                                className={styles.documentLink}
                                download
                              >
                                <IconDownload size={16} stroke={1.75} aria-hidden="true" />
                                {labels.download}
                                <span className="visually-hidden">: {name}</span>
                              </a>
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
