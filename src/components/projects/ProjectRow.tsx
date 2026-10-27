import Image from 'next/image'
import type { CvDictionary, ProjectSlug } from '@/content/types'
import { RichText } from '@/components/content/RichText'
import { TechIcon } from '@/components/icons/TechIcon'
import { ImagePlaceholder } from '@/components/sections/ImagePlaceholder'
import { ImageZoomTrigger } from './ImageZoomTrigger'
import { projectImageSrc } from '@/lib/server/assets'
import { getRuntimeProjects } from '@/lib/server/content-db'
import { plainText } from '@/lib/rich-text'
import styles from './ProjectRow.module.css'

type Props = {
  slug: ProjectSlug
  dictionary: CvDictionary
  accessToken?: string
}

export function ProjectRow({ slug, dictionary, accessToken }: Props) {
  const project = getRuntimeProjects()[slug]
  const copy = dictionary.projects.compact[slug]
  if (!project || !copy) return null
  const titleText = plainText(copy.title)
  const filename = project.images[0]
  const src = filename ? projectImageSrc(slug, filename, accessToken) : null

  return (
    <article className={styles.root} data-project-slug={slug}>
      <div className={styles.thumb}>
        {src && filename ? (
          <ImageZoomTrigger
            slug={slug}
            filename={filename}
            label={`${dictionary.projects.gallery.open}: ${plainText(copy.images[filename]?.alt ?? copy.title)}`}
          >
            <Image
              src={src}
              alt={plainText(copy.images[filename]?.alt ?? copy.title)}
              fill
              sizes="88px"
              className={styles.img}
              unoptimized
            />
          </ImageZoomTrigger>
        ) : (
          <ImagePlaceholder slug={slug} icon={project.stack[0] ?? 'linux'} />
        )}
      </div>
      <div>
        <p className={`mono-label ${styles.kicker}`}>
          <RichText text={copy.kicker} />
        </p>
        <h3 className={styles.title}>
          <RichText text={copy.title} />
        </h3>
        <p className={styles.oneLiner}>
          <RichText text={copy.oneLiner} />
        </p>
        {project.stack.length > 0 ? (
          <ul className={styles.stack}>
            {project.stack.map((techId) => (
              <li key={techId}>
                <TechIcon id={techId} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <button
        type="button"
        className={styles.details}
        data-project-details={slug}
        aria-label={`${dictionary.projects.details}: ${titleText}`}
      >
        {dictionary.projects.details}
      </button>
    </article>
  )
}
