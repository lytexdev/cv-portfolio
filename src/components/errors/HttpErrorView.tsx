import Link from 'next/link'
import styles from './HttpErrorView.module.css'

type Props = {
  status: number
  titleDe: string
  titleEn: string
  messageDe: string
  messageEn: string
}

export function HttpErrorView({
  status,
  titleDe,
  titleEn,
  messageDe,
  messageEn,
}: Props) {
  return (
    <main className={styles.root}>
      <p className={`mono-label ${styles.prompt}`}>immanuel@lytex ~&gt; status</p>
      <p className={styles.code}>{status}</p>
      <h1 className={styles.title}>
        {titleDe}
        <span className={styles.sep}> · </span>
        {titleEn}
      </h1>
      <p className={styles.message}>
        {messageDe}
        <br />
        {messageEn}
      </p>
      <Link href="/de" className={styles.back}>
        Zurück · Back
      </Link>
    </main>
  )
}
