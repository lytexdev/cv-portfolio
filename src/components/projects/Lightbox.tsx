'use client'

import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'
import Image from 'next/image'
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { CvDictionary } from '@/content/types'
import type { GalleryImage } from './Gallery'
import styles from './Lightbox.module.css'

export type ViewableImage = GalleryImage & { src: string }

type Props = {
  images: ViewableImage[]
  startIndex: number
  labels: CvDictionary['projects']['gallery']
  onClose: () => void
}

const SWIPE_THRESHOLD = 48

export function Lightbox({ images, startIndex, labels, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<Element | null>(null)
  const swipeStart = useRef<number | null>(null)
  const [index, setIndex] = useState(startIndex)
  const current = images[index]
  const hasMany = images.length > 1

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    returnFocus.current = document.activeElement
    if (!dialog.open) dialog.showModal()

    const onCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) onClose()
    }

    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('click', onClick)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      dialog.removeEventListener('click', onClick)
      if (dialog.open) dialog.close()
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus()
    }
  }, [onClose])

  if (!current) return null

  const go = (step: number) => {
    setIndex((prev) => (prev + step + images.length) % images.length)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (!hasMany) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = event.clientX
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (start === null || !hasMany) return
    const delta = event.clientX - start
    if (Math.abs(delta) >= SWIPE_THRESHOLD) go(delta < 0 ? 1 : -1)
  }

  return (
    <dialog ref={ref} className={styles.dialog} aria-label={current.alt} onKeyDown={onKeyDown}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <span className={styles.counter} aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <button
            type="button"
            className={styles.control}
            onClick={onClose}
            aria-label={labels.close}
          >
            <IconX size={20} stroke={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <Image
            key={current.filename}
            src={current.src}
            alt={current.alt}
            fill
            sizes="100vw"
            className={styles.img}
            unoptimized
            draggable={false}
          />
          {hasMany ? (
            <>
              <button
                type="button"
                className={`${styles.control} ${styles.prev}`}
                onClick={() => go(-1)}
                aria-label={labels.previous}
              >
                <IconChevronLeft size={22} stroke={1.75} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.control} ${styles.next}`}
                onClick={() => go(1)}
                aria-label={labels.next}
              >
                <IconChevronRight size={22} stroke={1.75} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>

        {current.caption ? <p className={styles.caption}>{current.caption}</p> : null}

        {hasMany ? (
          <ul className={styles.thumbs}>
            {images.map((image, i) => (
              <li key={image.filename}>
                <button
                  type="button"
                  className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`${image.alt} (${i + 1} / ${images.length})`}
                  aria-current={i === index ? 'true' : undefined}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes="80px"
                    className={styles.thumbImg}
                    unoptimized
                    draggable={false}
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </dialog>
  )
}
