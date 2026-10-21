import { person } from '@/content/shared'
import type { CvDictionary } from '@/content/types'
import type { PrivateData } from '@/lib/server/private-data'
import type { Viewer } from '@/lib/server/viewer'
import { PrintQr } from './PrintQr'
import styles from './PrintHeader.module.css'

type Props = {
  dictionary: CvDictionary
  viewer: Viewer
  privateData: PrivateData | null
  pageUrl: string
}

export async function PrintHeader({
  dictionary,
  viewer,
  privateData,
  pageUrl,
}: Props) {
  const contactParts: string[] = [person.email]

  if (viewer.kind === 'token' && privateData) {
    contactParts.push(privateData.phone)
    contactParts.push(
      `${privateData.street}, ${privateData.postalCode} ${privateData.city}`,
    )
  } else {
    contactParts.push(person.city)
  }

  return (
    <header className={`print-only ${styles.root}`}>
      <div>
        <p className={styles.name}>{person.name}</p>
        <p className={styles.role}>{dictionary.role}</p>
        <p className={styles.contact}>{contactParts.join(' · ')}</p>
        <p className={styles.url}>{pageUrl}</p>
      </div>
      <div className={styles.qr}>
        <PrintQr url={pageUrl} />
      </div>
    </header>
  )
}
