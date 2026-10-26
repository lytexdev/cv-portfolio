import styles from './TechIcon.module.css'

type Props = {
  icon: { path: string; fillRule?: 'evenodd' | 'nonzero' }
  title?: string
}

export function SimpleIcon({ icon, title }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.simple}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={icon.path} fill="currentColor" fillRule={icon.fillRule} />
    </svg>
  )
}
