import Image from 'next/image'
import { projects } from '@/content/shared'
import type { CvDictionary, ProjectSlug } from '@/content/types'
import { TechIcon } from '@/components/icons/TechIcon'
import { ImagePlaceholder } from '@/components/sections/ImagePlaceholder'
import { projectImageSrc } from '@/lib/server/assets'
import styles from './ProjectRow.module.css'

type Props = {
  slug: ProjectSlug
  dictionary: CvDictionary
}

export function ProjectRow({ slug, dictionary }: Props) {
  const project = projects[slug]
  const copy = dictionary.projects.compact[slug]
  const filename = project.images[0]
  const src = filename ? projectImageSrc(slug, filename) : null

  return (
    <article className={styles.root} data-project-slug={slug}>
      <div className={styles.thumb}>
        {src && filename ? (
          <Image
            src={src}
            alt={copy.images[filename]?.alt ?? copy.title}
            fill
            sizes="88px"
            className={styles.img}
          />
        ) : (
          <ImagePlaceholder slug={slug} icon={project.stack[0] ?? 'linux'} />
        )}
      </div>
      <div>
        <p className={`mono-label ${styles.kicker}`}>{copy.kicker}</p>
        <h3 className={styles.title}>{copy.title}</h3>
        <p className={styles.oneLiner}>{copy.oneLiner}</p>
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
      <button type="button" className={styles.details} data-project-details={slug}>
        {dictionary.projects.details}
      </button>
    </article>
  )
}
