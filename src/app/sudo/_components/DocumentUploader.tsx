'use client'

import { useRef, useState } from 'react'
import styles from '../sudo.module.css'

type Props = {
  action: (formData: FormData) => void | Promise<void>
  csrf: string
  ownerType: 'experience' | 'project'
  ownerId: string
  maxBytes: number
}

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp'

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function DocumentUploader({ action, csrf, ownerType, ownerId, maxBytes }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [label, setLabel] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [pending, setPending] = useState(false)
  const tooLarge = file !== null && file.size > maxBytes

  const applyFile = (next: File | undefined) => {
    if (!next) return
    setFile(next)
    if (!label)
      setLabel(
        next.name
          .replace(/\.[^.]+$/, '')
          .replace(/[_-]+/g, ' ')
          .trim(),
      )
  }

  return (
    <form
      action={async (formData) => {
        setPending(true)
        try {
          await action(formData)
        } finally {
          setPending(false)
        }
      }}
      encType="multipart/form-data"
      className={styles.uploadBlock}
    >
      <input type="hidden" name="csrf" value={csrf} />
      <input type="hidden" name="ownerType" value={ownerType} />
      <input type="hidden" name="ownerId" value={ownerId} />

      <button
        type="button"
        className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          const dropped = event.dataTransfer.files?.[0]
          if (dropped && inputRef.current) {
            const transfer = new DataTransfer()
            transfer.items.add(dropped)
            inputRef.current.files = transfer.files
            applyFile(dropped)
          }
        }}
      >
        {file ? (
          <span>
            {file.name}
            <span className={styles.muted}> {formatSize(file.size)}</span>
          </span>
        ) : (
          <span>
            Drop document here or click to choose
            <span className={styles.muted}> PDF, JPEG, PNG, WebP · max {formatSize(maxBytes)}</span>
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        className={styles.fileHidden}
        type="file"
        name="file"
        accept={ACCEPT}
        required
        onChange={(event) => applyFile(event.target.files?.[0])}
      />

      <div className={styles.grid2}>
        <label className={styles.label}>
          Label (DE)
          <input
            className={styles.input}
            name="label_de"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Arbeitszeugnis"
            maxLength={120}
            required
          />
        </label>
        <label className={styles.label}>
          Label (EN, optional)
          <input
            className={styles.input}
            name="label_en"
            placeholder="Reference letter"
            maxLength={120}
          />
        </label>
      </div>

      {tooLarge ? (
        <p className={`${styles.flash} ${styles.flashError}`}>
          File is larger than {formatSize(maxBytes)}.
        </p>
      ) : null}

      <button
        className={styles.button}
        type="submit"
        disabled={pending || !file || !label || tooLarge}
      >
        {pending ? 'Uploading and cleaning...' : 'Upload document'}
      </button>
    </form>
  )
}
