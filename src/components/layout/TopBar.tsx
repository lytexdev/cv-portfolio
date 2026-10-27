import { IconSearch, IconTerminal2 } from '@tabler/icons-react'
import type { CvDictionary, Locale } from '@/content/types'
import { LangSwitch } from '@/components/interactive/LangSwitch'
import { ThemeToggle } from '@/components/interactive/ThemeToggle'
import { Tooltip } from '@/components/interactive/Tooltip'
import controlStyles from '@/components/interactive/ControlButton.module.css'
import styles from './TopBar.module.css'

type Props = {
  locale: Locale
  dictionary: CvDictionary
  personName: string
  token?: string
}

export function TopBar({ locale, dictionary, personName, token }: Props) {
  return (
    <header className={`topbar-root ${styles.root}`} data-boot-step="0">
      <div className={`page-shell ${styles.inner}`}>
        <a href="#whoami" className={styles.name}>
          {personName}
        </a>
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
          <LangSwitch
            locale={locale}
            label={dictionary.palette.actions.lang}
            token={token}
          />
        </div>
      </div>
    </header>
  )
}
