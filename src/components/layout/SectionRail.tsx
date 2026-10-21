import { IconSearch, IconTerminal2 } from '@tabler/icons-react'
import { Suspense } from 'react'
import { sectionOrder } from '@/content/shared'
import type { CvDictionary, Locale, SectionId } from '@/content/types'
import { LangSwitch } from '@/components/interactive/LangSwitch'
import { ThemeToggle } from '@/components/interactive/ThemeToggle'
import { Tooltip } from '@/components/interactive/Tooltip'
import controlStyles from '@/components/interactive/ControlButton.module.css'
import styles from './SectionRail.module.css'

type Props = {
  locale: Locale
  dictionary: CvDictionary
}

export function SectionRail({ locale, dictionary }: Props) {
  return (
    <nav className={`rail-root ${styles.root}`} aria-label="Sections">
      <ul className={styles.list}>
        {sectionOrder.map((id: SectionId) => {
          const section = dictionary.sections[id]
          return (
            <li key={id}>
              <a href={`#${id}`} className={styles.link} data-section-link={id}>
                <span className={`mono-label ${styles.index}`}>{section.rail}</span>
                <span className={styles.label}>{section.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
      <div className={styles.actions}>
        <Tooltip label={`${dictionary.palette.placeholder} (Ctrl+K)`}>
          <button
            type="button"
            className={controlStyles.button}
            data-open-palette
            aria-label={`${dictionary.palette.placeholder} (Ctrl+K)`}
          >
            <IconSearch size={18} stroke={1.75} aria-hidden="true" />
          </button>
        </Tooltip>
        <Tooltip label={dictionary.terminal.open}>
          <button
            type="button"
            className={controlStyles.button}
            data-open-terminal
            aria-label={dictionary.terminal.open}
          >
            <IconTerminal2 size={18} stroke={1.75} aria-hidden="true" />
          </button>
        </Tooltip>
        <ThemeToggle
          toLightLabel={dictionary.theme.toLight}
          toDarkLabel={dictionary.theme.toDark}
        />
        <Suspense fallback={null}>
          <LangSwitch locale={locale} label={dictionary.palette.actions.lang} />
        </Suspense>
      </div>
    </nav>
  )
}
