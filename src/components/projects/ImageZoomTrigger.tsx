import type { ReactNode } from 'react'
import styles from './ImageZoomTrigger.module.css'

type Props = {
  slug: string
  filename: string
  label: string
  children: ReactNode
}

export function ImageZoomTrigger({ slug, filename, label, children }: Props) {
  return (
    <button
      type="button"
      className={styles.root}
      data-project-image={slug}
      data-image-file={filename}
      aria-label={label}
    >
      {children}
    </button>
  )
}
