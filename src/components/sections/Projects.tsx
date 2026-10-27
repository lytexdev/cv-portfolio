import type { CvDictionary } from '@/content/types'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { FeaturedProject } from '@/components/projects/FeaturedProject'
import { ProjectRow } from '@/components/projects/ProjectRow'
import {
  getRuntimeCompactOrder,
  getRuntimeFeaturedOrder,
} from '@/lib/server/content-db'
import styles from './Projects.module.css'

type Props = {
  dictionary: CvDictionary
  accessToken?: string
}

export function Projects({ dictionary, accessToken }: Props) {
  const section = dictionary.sections.projects
  const featuredProjectOrder = getRuntimeFeaturedOrder()
  const compactProjectOrder = getRuntimeCompactOrder()

  return (
    <section
      id="projects"
      className="section"
      aria-labelledby="projects-title"
      data-reveal
    >
      <SectionHeading id="projects" rail={section.rail} title={section.title} />
      <div className={styles.featured}>
        {featuredProjectOrder.map((slug, index) => (
          <FeaturedProject
            key={slug}
            slug={slug}
            dictionary={dictionary}
            accessToken={accessToken}
            alternate={index % 2 === 1}
            defaultOpen={index === 0}
          />
        ))}
      </div>
      <div className={styles.compact}>
        {compactProjectOrder.map((slug) => (
          <ProjectRow
            key={slug}
            slug={slug}
            dictionary={dictionary}
            accessToken={accessToken}
          />
        ))}
      </div>
    </section>
  )
}
