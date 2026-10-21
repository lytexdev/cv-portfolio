import type { TechId } from '@/content/types'
import { SimpleIcon } from './SimpleIcon'
import { techRegistry } from './registry'
import styles from './TechIcon.module.css'

type Props = {
  id: TechId
  showLabel?: boolean
}

export function TechIcon({ id, showLabel = false }: Props) {
  const def = techRegistry[id]
  if (!def) return null

  return (
    <span className={styles.root}>
      {def.source === 'tabler' ? (
        <def.icon size={20} stroke={1.75} aria-hidden="true" className={styles.tabler} />
      ) : (
        <SimpleIcon icon={def.icon} />
      )}
      {showLabel ? <span className={styles.label}>{def.label}</span> : null}
      {!showLabel ? <span className="visually-hidden">{def.label}</span> : null}
    </span>
  )
}
