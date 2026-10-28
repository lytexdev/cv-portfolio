import { IconDownload, IconEye, IconFileTypePdf, IconPhoto } from '@tabler/icons-react'
import type { CvDictionary, Locale } from '@/content/types'
import styles from './DocumentList.module.css'

export type DocumentLink = {
  id: string
  label: string
  kind: 'pdf' | 'image'
  size: number
  href: string
}

type Props = {
  documents: DocumentLink[]
  locale: Locale
  labels: CvDictionary['documents']
  externalNewTab: string
}

function formatSize(bytes: number, locale: Locale): string {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  return bytes >= 1024 * 1024
    ? `${formatter.format(bytes / 1024 / 1024)} MB`
    : `${formatter.format(Math.max(1, Math.round(bytes / 1024)))} KB`
}

export function DocumentList({ documents, locale, labels, externalNewTab }: Props) {
  if (documents.length === 0) return null

  return (
    <div className={`no-print ${styles.documents}`}>
      <p className={`mono-label ${styles.documentsTitle}`}>{labels.title}</p>
      <ul className={styles.documentList}>
        {documents.map((document) => {
          const Icon = document.kind === 'pdf' ? IconFileTypePdf : IconPhoto
          return (
            <li key={document.id} className={styles.document}>
              <span className={styles.documentName}>
                <Icon size={20} stroke={1.75} aria-hidden="true" />
                <span>
                  {document.label}
                  <span className={styles.documentMeta}>
                    {document.kind === 'pdf' ? labels.pdf : labels.image} ·{' '}
                    {formatSize(document.size, locale)}
                  </span>
                </span>
              </span>
              <span className={styles.documentActions}>
                <a
                  href={document.href}
                  className={styles.documentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconEye size={16} stroke={1.75} aria-hidden="true" />
                  {labels.view}
                  <span className="visually-hidden">
                    : {document.label} {externalNewTab}
                  </span>
                </a>
                <a href={`${document.href}&download=1`} className={styles.documentLink} download>
                  <IconDownload size={16} stroke={1.75} aria-hidden="true" />
                  {labels.download}
                  <span className="visually-hidden">: {document.label}</span>
                </a>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
