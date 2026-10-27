import type { CustomIcon } from './custom-icons'
import styles from './TechIcon.module.css'

type Props = {
  icon: { path: string } | CustomIcon
  title?: string
}

export function SimpleIcon({ icon, title }: Props) {
  const layers = 'layers' in icon ? icon.layers : [{ d: icon.path }]
  return (
    <svg
      viewBox={'viewBox' in icon && icon.viewBox ? icon.viewBox : '0 0 24 24'}
      className={styles.simple}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {layers.map((layer) => (
        <path
          key={layer.d}
          d={layer.d}
          fill="currentColor"
          fillRule={'fillRule' in layer ? layer.fillRule : undefined}
          transform={'transform' in layer ? layer.transform : undefined}
        />
      ))}
    </svg>
  )
}
