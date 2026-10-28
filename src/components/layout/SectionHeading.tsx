import { RichText } from '@/components/content/RichText'
import styles from './SectionHeading.module.css'

type Props = {
  id: string
  rail: string
  title: string
  hideTitle?: boolean
  bootStep?: string
}

export function SectionHeading({ id, rail, title, hideTitle = false, bootStep }: Props) {
  return (
    <div className={styles.root} data-boot-step={bootStep}>
      <p className={`mono-label ${styles.rail}`} id={`${id}-label`}>
        {rail}
      </p>
      <h2 id={`${id}-title`} className={hideTitle ? 'visually-hidden' : styles.title}>
        <RichText text={title} />
      </h2>
    </div>
  )
}
