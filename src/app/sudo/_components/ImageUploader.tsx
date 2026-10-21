'use client'

import { useRef, useState } from 'react'
import styles from '../sudo.module.css'

type Props = {
  action: (formData: FormData) => void | Promise<void>
  csrf: string
  slug: string
}

export function ImageUploader({ action, csrf, slug }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [pending, setPending] = useState(false)

  const applyFile = (file: File | undefined) => {
    if (!file) return
    const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-')
    setFileName(base || `img-${Date.now()}`)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
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
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="name" value={fileName} />

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
          const file = event.dataTransfer.files?.[0]
          if (file && inputRef.current) {
            const transfer = new DataTransfer()
            transfer.items.add(file)
            inputRef.current.files = transfer.files
            applyFile(file)
          }
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className={styles.dropPreview} />
        ) : (
          <span>
            Drop image here or click to choose
            <span className={styles.muted}> JPEG, PNG, WebP · max 8 MB</span>
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        className={styles.fileHidden}
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp"
        required
        onChange={(event) => applyFile(event.target.files?.[0])}
      />

      <label className={styles.label}>
        Filename base
        <input
          className={styles.input}
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
          placeholder="01"
          required
        />
      </label>

      <button className={styles.button} type="submit" disabled={pending || !fileName}>
        {pending ? 'Uploading...' : 'Upload image'}
      </button>
    </form>
  )
}
