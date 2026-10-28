'use client'

import { IconExternalLink, IconX } from '@tabler/icons-react'
import { useEffect, useRef } from 'react'
import { TechIcon } from '@/components/icons/TechIcon'
import type { CvDictionary, Locale, TechId } from '@/content/types'
import { DocumentList, type DocumentLink } from '@/components/content/DocumentList'
import { RichText } from '@/components/content/RichText'
import { Gallery, type GalleryImage } from './Gallery'
import styles from './ProjectDialog.module.css'

export type ProjectDialogData = {
  slug: string
  kicker: string
  title: string
  summary: string
  highlights: string[]
  stack: TechId[]
  href?: string
  linkLabel: string
  documents: DocumentLink[]
  images: GalleryImage[]
}

type Props = {
  open: boolean
  onClose: () => void
  project: ProjectDialogData | null
  labelledBy: string
  externalNewTab: string
  locale: Locale
  documentLabels: CvDictionary['documents']
  openImageLabel: string
  onOpenImage: (filename: string) => void
}

export function ProjectDialog({
  open,
  onClose,
  project,
  labelledBy,
  externalNewTab,
  locale,
  documentLabels,
  openImageLabel,
  onOpenImage,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<Element | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && project) {
      returnFocus.current = document.activeElement
      if (!dialog.open) {
        dialog.showModal()
      }
    } else if (dialog.open) {
      dialog.close()
      if (returnFocus.current instanceof HTMLElement) {
        returnFocus.current.focus()
      }
    }
  }, [open, project])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose()
      }
    }

    const onCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }

    dialog.addEventListener('click', onClick)
    dialog.addEventListener('cancel', onCancel)
    return () => {
      dialog.removeEventListener('click', onClick)
      dialog.removeEventListener('cancel', onCancel)
    }
  }, [onClose])

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby={labelledBy}>
      {project ? (
        <div className={styles.inner}>
          <div className={styles.header}>
            <div>
              <p className={`mono-label ${styles.kicker}`}>
                <RichText text={project.kicker} />
              </p>
              <h2 id={labelledBy}>
                <RichText text={project.title} />
              </h2>
            </div>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              <IconX size={18} stroke={1.75} aria-hidden="true" />
            </button>
          </div>

          <Gallery
            images={project.images}
            slug={project.slug}
            fallbackIcon={project.stack[0] ?? 'linux'}
            openLabel={openImageLabel}
            onOpenImage={onOpenImage}
          />

          <p className={styles.summary}>
            <RichText text={project.summary} />
          </p>
          {project.highlights.length > 0 ? (
            <ul className={styles.highlights}>
              {project.highlights.map((item) => (
                <li key={item}>
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          ) : null}
          <ul className={styles.stack}>
            {project.stack.map((techId) => (
              <li key={techId}>
                <TechIcon id={techId} showLabel />
              </li>
            ))}
          </ul>
          {project.href ? (
            <a
              href={project.href}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.linkLabel}
              <IconExternalLink size={16} stroke={1.75} aria-hidden="true" />
              <span className="visually-hidden"> {externalNewTab}</span>
            </a>
          ) : null}
          <DocumentList
            documents={project.documents}
            locale={locale}
            labels={documentLabels}
            externalNewTab={externalNewTab}
          />
        </div>
      ) : null}
    </dialog>
  )
}
