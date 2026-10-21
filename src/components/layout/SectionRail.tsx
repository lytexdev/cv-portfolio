import { sectionOrder } from '@/content/shared'
import type { CvDictionary, Locale, SectionId } from '@/content/types'
import styles from './SectionRail.module.css'

type Props = {
  locale: Locale
  dictionary: CvDictionary
}

export function SectionRail({ locale, dictionary }: Props) {
  return (
    <nav className={styles.root} aria-label="Sections">
      <ul className={styles.list}>
        {sectionOrder.map((id: SectionId) => {
          const section = dictionary.sections[id]
          return (
            <li key={id}>
              <a href={`/${locale}#${id}`} className={styles.link} data-section-link={id}>
                <span className={`mono-label ${styles.index}`}>{section.rail}</span>
                <span className={styles.label}>{section.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
      <div className={styles.actions} data-rail-actions />
    </nav>
  )
}
