'use client'

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import Image from 'next/image'
import { useState } from 'react'
import { ImagePlaceholder } from '@/components/sections/ImagePlaceholder'
import { RichText } from '@/components/content/RichText'
import type { TechId } from '@/content/types'
import styles from './Gallery.module.css'

export type GalleryImage = {
  src: string | null
  alt: string
  caption: string
  filename: string
}

type Props = {
  images: GalleryImage[]
  slug: string
  fallbackIcon?: TechId
  openLabel: string
  onOpenImage: (filename: string) => void
}

export function Gallery({ images, slug, fallbackIcon = 'linux', openLabel, onOpenImage }: Props) {
  const [index, setIndex] = useState(0)
  const current = images[index] ?? images[0]

  if (!current) {
    return null
  }

  const go = (next: number) => {
    setIndex((next + images.length) % images.length)
  }

  return (
    <div>
      <div className={styles.main}>
        {current.src ? (
          <button
            type="button"
            className={styles.zoom}
            onClick={() => onOpenImage(current.filename)}
            aria-label={`${openLabel}: ${current.alt}`}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className={styles.img}
              unoptimized
            />
          </button>
        ) : (
          <ImagePlaceholder slug={slug} icon={fallbackIcon} />
        )}
      </div>

      {images.length > 1 ? (
        <div className={styles.thumbs}>
          {images.map((image, i) => (
            <button
              key={image.filename}
              type="button"
              className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`${image.alt} (${i + 1} / ${images.length})`}
            >
              {image.src ? (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="68px"
                  className={styles.img}
                  unoptimized
                />
              ) : (
                <ImagePlaceholder slug={slug} icon={fallbackIcon} />
              )}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.nav}>
        <p className={styles.caption}>
          <RichText text={current.caption} />
        </p>
        <div className={styles.navButtons}>
          <span className={styles.counter}>
            {index + 1} / {images.length}
          </span>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => go(index - 1)}
                aria-label="Previous"
              >
                <IconChevronLeft size={18} stroke={1.75} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => go(index + 1)}
                aria-label="Next"
              >
                <IconChevronRight size={18} stroke={1.75} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
