import { RichText } from '@/components/content/RichText'
import styles from './SectionHeading.module.css'

type Props = {
  id: string
  rail: string
  title: string
}

export function SectionHeading({ id, rail, title }: Props) {
  return (
    <div className={styles.root}>
      <p className={`mono-label ${styles.rail}`} id={`${id}-label`}>
        {rail}
      </p>
      <h2 id={`${id}-title`} className={styles.title}>
        <RichText text={title} />
      </h2>
    </div>
  )
}
