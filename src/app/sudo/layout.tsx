import type { ReactNode } from 'react'
import styles from './sudo.module.css'

type Props = {
  children: ReactNode
}

export default function SudoLayout({ children }: Props) {
  return <div className={styles.shell}>{children}</div>
}
