import { IconCommand, IconTerminal2 } from '@tabler/icons-react'
import { Suspense } from 'react'
import { person } from '@/content/shared'
import type { CvDictionary, Locale } from '@/content/types'
import { LangSwitch } from '@/components/interactive/LangSwitch'
import { ShortcutHint } from '@/components/interactive/ShortcutHint'
import { ThemeToggle } from '@/components/interactive/ThemeToggle'
import controlStyles from '@/components/interactive/ControlButton.module.css'
import styles from './TopBar.module.css'

type Props = {
  locale: Locale
  dictionary: CvDictionary
}

export function TopBar({ locale, dictionary }: Props) {
  return (
    <header className={`topbar-root ${styles.root}`}>
      <div className={`page-shell ${styles.inner}`}>
        <a href={`/${locale}#whoami`} className={styles.name}>
          {person.name}
        </a>
        <div className={styles.actions}>
          <button
            type="button"
            className={controlStyles.button}
            data-open-palette
            aria-label={dictionary.palette.placeholder}
          >
            <IconCommand size={18} stroke={1.75} aria-hidden="true" />
            <ShortcutHint />
          </button>
          <button
            type="button"
            className={controlStyles.button}
            data-open-terminal
            aria-label={dictionary.terminal.open}
          >
            <IconTerminal2 size={18} stroke={1.75} aria-hidden="true" />
          </button>
          <ThemeToggle
            toLightLabel={dictionary.theme.toLight}
            toDarkLabel={dictionary.theme.toDark}
          />
          <Suspense fallback={null}>
            <LangSwitch locale={locale} label={dictionary.palette.actions.lang} />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
