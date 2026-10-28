import { IconExternalLink } from '@tabler/icons-react'
import Image from 'next/image'
import type { CvDictionary, Locale, ProjectSlug } from '@/content/types'
import { Collapsible } from '@/components/content/Collapsible'
import { DocumentList } from '@/components/content/DocumentList'
import { RichText } from '@/components/content/RichText'
import { TechIcon } from '@/components/icons/TechIcon'
import { ImagePlaceholder } from '@/components/sections/ImagePlaceholder'
import { ImageZoomTrigger } from './ImageZoomTrigger'
import { ProjectStatus } from './ProjectStatus'
import { projectImageSrc } from '@/lib/server/assets'
import { defaultProjectStatus } from '@/content/shared'
import { getRuntimeProjects } from '@/lib/server/content-db'
import { documentLinks } from '@/lib/server/documents'
import { plainText } from '@/lib/rich-text'
import styles from './FeaturedProject.module.css'

type Props = {
  slug: ProjectSlug
  locale: Locale
  dictionary: CvDictionary
  accessToken?: string
  alternate?: boolean
}

export function FeaturedProject({
  slug,
  locale,
  dictionary,
  accessToken,
  alternate = false,
}: Props) {
  const project = getRuntimeProjects()[slug]
  const copy = dictionary.projects.featured[slug]
  if (!project || !copy) return null
  const altFor = (filename: string) => plainText(copy.images[filename]?.alt ?? copy.title)
  const mainImage = project.images[0]
  const mainSrc = mainImage ? projectImageSrc(slug, mainImage, accessToken) : null

  return (
    <article className={`${styles.root} ${alternate ? styles.rootAlt : ''}`}>
      <div className={styles.media}>
        <div className={styles.mainImage}>
          {mainSrc && mainImage ? (
            <ImageZoomTrigger
              slug={slug}
              filename={mainImage}
              label={`${dictionary.projects.gallery.open}: ${altFor(mainImage)}`}
            >
              <Image
                src={mainSrc}
                alt={altFor(mainImage)}
                fill
                sizes="(max-width: 1023px) 100vw, 55vw"
                className={styles.img}
                unoptimized
              />
            </ImageZoomTrigger>
          ) : (
            <ImagePlaceholder slug={slug} icon={project.stack[0] ?? 'linux'} />
          )}
        </div>
        {project.images.length > 1 ? (
          <ul className={styles.thumbs}>
            {project.images.slice(1).map((filename) => {
              const src = projectImageSrc(slug, filename, accessToken)
              return (
                <li key={filename} className={styles.thumb}>
                  {src ? (
                    <ImageZoomTrigger
                      slug={slug}
                      filename={filename}
                      label={`${dictionary.projects.gallery.open}: ${altFor(filename)}`}
                    >
                      <Image
                        src={src}
                        alt={altFor(filename)}
                        fill
                        sizes="72px"
                        className={styles.img}
                        unoptimized
                      />
                    </ImageZoomTrigger>
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
        <ProjectStatus
          className={styles.kicker}
          status={project.status ?? defaultProjectStatus}
          startYear={project.startYear}
          kicker={copy.kicker}
          labels={dictionary.projects}
        />
        <h3 className={styles.title}>
          <RichText text={copy.title} />
        </h3>
        <p className={styles.summary}>
          <RichText text={copy.summary} />
        </p>
        {Array.isArray(copy.highlights) && copy.highlights.length > 0 ? (
          <Collapsible showLabel={dictionary.collapse.show} hideLabel={dictionary.collapse.hide}>
            <ul className={styles.highlights}>
              {copy.highlights.map((item) => (
                <li key={item}>
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          </Collapsible>
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
        <DocumentList
          documents={documentLinks({ type: 'project', id: slug }, accessToken, locale)}
          locale={locale}
          labels={dictionary.documents}
          externalNewTab={dictionary.externalNewTab}
        />
      </div>
    </article>
  )
}
