import type { TechId } from '@/content/types'
import { TechIcon } from '@/components/icons/TechIcon'
import styles from './ImagePlaceholder.module.css'

type Props = {
  slug: string
  icon?: TechId
}

export function ImagePlaceholder({ slug, icon = 'linux' }: Props) {
  return (
    <div className={styles.root} aria-hidden="true">
      <TechIcon id={icon} />
      <span className={styles.slug}>{slug}</span>
    </div>
  )
}
