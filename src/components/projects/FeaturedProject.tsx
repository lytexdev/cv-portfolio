import { IconExternalLink } from '@tabler/icons-react'
import Image from 'next/image'
import type { CvDictionary, ProjectSlug } from '@/content/types'
import { TechIcon } from '@/components/icons/TechIcon'
import { ImagePlaceholder } from '@/components/sections/ImagePlaceholder'
import { projectImageSrc } from '@/lib/server/assets'
import { getRuntimeProjects } from '@/lib/server/content-db'
import styles from './FeaturedProject.module.css'

type Props = {
  slug: ProjectSlug
  dictionary: CvDictionary
  alternate?: boolean
}

export function FeaturedProject({ slug, dictionary, alternate = false }: Props) {
  const project = getRuntimeProjects()[slug]
  const copy = dictionary.projects.featured[slug]
  if (!project || !copy) return null
  const mainImage = project.images[0]
  const mainSrc = mainImage ? projectImageSrc(slug, mainImage) : null

  return (
    <article className={`${styles.root} ${alternate ? styles.rootAlt : ''}`}>
      <div className={styles.media}>
        <div className={styles.mainImage}>
          {mainSrc && mainImage ? (
            <Image
              src={mainSrc}
              alt={copy.images[mainImage]?.alt ?? copy.title}
              fill
              sizes="(max-width: 1023px) 100vw, 55vw"
              className={styles.img}
            />
          ) : (
            <ImagePlaceholder slug={slug} icon={project.stack[0] ?? 'linux'} />
          )}
        </div>
        {project.images.length > 1 ? (
          <ul className={styles.thumbs}>
            {project.images.slice(1).map((filename) => {
              const src = projectImageSrc(slug, filename)
              return (
                <li key={filename} className={styles.thumb}>
                  {src ? (
                    <Image
                      src={src}
                      alt={copy.images[filename]?.alt ?? copy.title}
                      fill
                      sizes="72px"
                      className={styles.img}
                    />
                  ) : (
                    <ImagePlaceholder slug={slug} icon={project.stack[0] ?? 'linux'} />
                  )}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>

      <div className={styles.body}>
        <p className={`mono-label ${styles.kicker}`}>{copy.kicker}</p>
        <h3 className={styles.title}>{copy.title}</h3>
        <p className={styles.summary}>{copy.summary}</p>
        {copy.highlights.length > 0 ? (
          <ul className={styles.highlights}>
            {copy.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        <ul className={styles.stack}>
          {project.stack.map((techId) => (
            <li key={techId}>
              <TechIcon id={techId} />
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
            {copy.linkLabel || dictionary.projects.viewProject}
            <IconExternalLink size={16} stroke={1.75} aria-hidden="true" />
            <span className="visually-hidden"> {dictionary.externalNewTab}</span>
          </a>
        ) : null}
      </div>
    </article>
  )
}
