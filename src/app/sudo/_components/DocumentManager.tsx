import { MAX_DOCUMENT_BYTES, listDocuments, type DocumentOwner } from '@/lib/server/documents'
import { deleteDocumentAction, reorderDocumentsAction, uploadDocumentAction } from '../actions'
import { ConfirmForm } from './ConfirmForm'
import { DocumentUploader } from './DocumentUploader'
import { SortableList } from './SortableList'
import styles from '../sudo.module.css'

type Props = {
  owner: DocumentOwner
  csrf: string
  description: string
}

export function DocumentManager({ owner, csrf, description }: Props) {
  const documents = listDocuments(owner)

  return (
    <>
      <p className={styles.sectionLabel}>Documents</p>
      <p className={styles.muted}>
        {description} Visible on the CV only with a valid access token. PDFs are rewritten without
        metadata, scripts, forms or attachments, images are re-encoded without EXIF/GPS. Encrypted
        PDFs are rejected.
      </p>
      {documents.length > 0 ? (
        <SortableList
          key={documents.map((document) => document.id).join('|')}
          action={reorderDocumentsAction}
          csrf={csrf}
          fields={{ ownerType: owner.type, ownerId: owner.id }}
          items={documents.map((document) => ({
            id: document.id,
            label: document.label.de,
            content: (
              <div className={styles.documentRow}>
                <div>
                  <span className={styles.sideItemTitle}>{document.label.de}</span>
                  <span className={styles.muted}>
                    {' '}
                    {document.label.en !== document.label.de ? `/ ${document.label.en} ` : ''}·{' '}
                    {document.kind === 'pdf' ? 'PDF' : 'Image'} ·{' '}
                    {Math.max(1, Math.round(document.size / 1024))} KB
                  </span>
                </div>
                <div className={styles.buttonRow}>
                  <a
                    className={styles.buttonGhost}
                    href={`/media/documents/${document.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                  <ConfirmForm
                    action={deleteDocumentAction}
                    title="Delete document?"
                    message={`Delete "${document.label.de}"? The file is removed from disk.`}
                    confirmLabel="Delete"
                  >
                    <input type="hidden" name="csrf" value={csrf} />
                    <input type="hidden" name="id" value={document.id} />
                    <button className={`${styles.button} ${styles.buttonDanger}`} type="submit">
                      Delete
                    </button>
                  </ConfirmForm>
                </div>
              </div>
            ),
          }))}
        />
      ) : (
        <p className={styles.muted}>No documents yet.</p>
      )}
      <DocumentUploader
        action={uploadDocumentAction}
        csrf={csrf}
        ownerType={owner.type}
        ownerId={owner.id}
        maxBytes={MAX_DOCUMENT_BYTES}
      />
    </>
  )
}
