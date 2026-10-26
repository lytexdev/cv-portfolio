import type { TechId } from '@/content/types'
import { Tooltip } from '@/components/interactive/Tooltip'
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

  const icon =
    def.source === 'tabler' ? (
      <def.icon size={20} stroke={1.75} aria-hidden="true" className={styles.tabler} />
    ) : (
      <SimpleIcon icon={def.icon} />
    )

  if (showLabel) {
    return (
      <span className={styles.root}>
        {icon}
        <span className={styles.label}>{def.label}</span>
      </span>
    )
  }

  return (
    <Tooltip label={def.label}>
      <span className={styles.root}>
        {icon}
        <span className="visually-hidden">{def.label}</span>
      </span>
    </Tooltip>
  )
}
