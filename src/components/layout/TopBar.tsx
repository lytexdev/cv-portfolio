import { person } from '@/content/shared'
import type { Locale } from '@/content/types'
import styles from './TopBar.module.css'

type Props = {
  locale: Locale
}

export function TopBar({ locale }: Props) {
  return (
    <header className={styles.root}>
      <div className={`page-shell ${styles.inner}`}>
        <a href={`/${locale}#whoami`} className={styles.name}>
          {person.name}
        </a>
        <div className={styles.actions} data-topbar-actions />
      </div>
    </header>
  )
}
