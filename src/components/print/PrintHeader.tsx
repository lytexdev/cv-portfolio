import type { CvDictionary } from '@/content/types'
import type { PrivateData } from '@/lib/server/private-data'
import type { Viewer } from '@/lib/server/viewer'
import { RichText } from '@/components/content/RichText'
import { PrintQr } from './PrintQr'
import styles from './PrintHeader.module.css'

type Props = {
  dictionary: CvDictionary
  viewer: Viewer
  privateData: PrivateData | null
  pageUrl: string
  personName: string
  email: string
  city: string
}

export async function PrintHeader({
  dictionary,
  viewer,
  privateData,
  pageUrl,
  personName,
  email,
  city,
}: Props) {
  const contactParts: string[] = [email]

  if (viewer.kind === 'token' && privateData) {
    contactParts.push(privateData.phone)
    contactParts.push(`${privateData.street}, ${privateData.postalCode} ${privateData.city}`)
  } else {
    contactParts.push(city)
  }

  return (
    <header className={`print-only ${styles.root}`}>
      <div>
        <p className={styles.name}>{personName}</p>
        <p className={styles.role}>
          <RichText text={dictionary.role} />
        </p>
        <p className={styles.contact}>{contactParts.join(' · ')}</p>
        <p className={styles.url}>{pageUrl}</p>
      </div>
      <div className={styles.qr}>
        <PrintQr url={pageUrl} />
      </div>
    </header>
  )
}
