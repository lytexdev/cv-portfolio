import styles from '../sudo.module.css'

const DOCUMENT_ERRORS: Record<string, string> = {
  size: 'Upload failed: the file is empty or larger than 9 MB.',
  type: 'Upload failed: only PDF, JPEG, PNG and WebP files are accepted.',
  encrypted:
    'Upload failed: encrypted or password-protected PDFs cannot be cleaned. Print the file to a new PDF first.',
  pages: 'Upload failed: the PDF has more than 100 pages.',
  invalid: 'Upload failed: the file could not be read or is damaged.',
}

type Props = {
  uploaded?: string
  error?: string
}

export function DocumentFlash({ uploaded, error }: Props) {
  if (error) {
    return (
      <p className={`${styles.flash} ${styles.flashError}`}>
        {DOCUMENT_ERRORS[error] ?? DOCUMENT_ERRORS.invalid}
      </p>
    )
  }
  if (uploaded) {
    return (
      <p className={`${styles.flash} ${styles.flashOk}`}>
        Document uploaded. Metadata and active content were removed.
      </p>
    )
  }
  return null
}
