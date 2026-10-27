import { IconChevronDown } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import styles from './Collapsible.module.css'

type Props = {
  showLabel: string
  hideLabel: string
  defaultOpen?: boolean
  children: ReactNode
}

export function Collapsible({ showLabel, hideLabel, defaultOpen = false, children }: Props) {
  return (
    <details className={styles.root} open={defaultOpen} data-collapsible>
      <summary className={styles.summary}>
        <IconChevronDown size={16} stroke={1.75} aria-hidden="true" className={styles.chevron} />
        <span className={styles.show}>{showLabel}</span>
        <span className={styles.hide}>{hideLabel}</span>
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  )
}
