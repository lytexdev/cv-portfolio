import type { CvDictionary, ProjectStatus as Status } from '@/content/types'
import { RichText } from '@/components/content/RichText'
import { Tooltip } from '@/components/interactive/Tooltip'
import styles from './ProjectStatus.module.css'

type Props = {
  status: Status
  startYear?: number
  kicker: string
  labels: CvDictionary['projects']
  className?: string
}

export function ProjectStatus({ status, startYear, kicker, labels, className = '' }: Props) {
  const statusLabel = `${labels.status.label}: ${labels.status[status]}`

  return (
    <p className={`mono-label ${styles.root} ${className}`}>
      <Tooltip label={statusLabel} placement="end">
        <button
          type="button"
          className={`${styles.dot} ${styles[status]}`}
          aria-label={statusLabel}
        />
      </Tooltip>
      {startYear ? (
        <span className={styles.year}>{labels.started.replace('{year}', String(startYear))}</span>
      ) : null}
      {kicker ? (
        <span className={styles.kicker}>
          <RichText text={kicker} />
        </span>
      ) : null}
    </p>
  )
}
