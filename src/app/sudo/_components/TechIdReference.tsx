import { TechIcon } from '@/components/icons/TechIcon'
import { techIds } from '@/components/icons/registry'
import styles from '../sudo.module.css'

export function TechIdReference() {
  return (
    <details className={styles.card}>
      <summary>Available tech IDs ({techIds.length})</summary>
      <ul className={styles.techList}>
        {techIds.map((id) => (
          <li key={id} className={styles.techItem}>
            <TechIcon id={id} showLabel />
            <code>{id}</code>
          </li>
        ))}
      </ul>
    </details>
  )
}
