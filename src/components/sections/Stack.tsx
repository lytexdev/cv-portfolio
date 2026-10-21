import { moreSkills, stackGroups } from '@/content/shared'
import type { CvDictionary, StackGroupId } from '@/content/types'
import { TechIcon } from '@/components/icons/TechIcon'
import { SectionHeading } from '@/components/layout/SectionHeading'
import styles from './Stack.module.css'

const groupOrder: StackGroupId[] = [
  'languages',
  'frontend',
  'backend',
  'infra',
  'security',
  'tools',
]

type Props = {
  dictionary: CvDictionary
}

export function Stack({ dictionary }: Props) {
  const section = dictionary.sections.stack

  return (
    <section id="stack" className="section" aria-labelledby="stack-title" data-reveal>
      <SectionHeading id="stack" rail={section.rail} title={section.title} />
      <div className={styles.groups}>
        {groupOrder.map((groupId) => (
          <div key={groupId} className={styles.group}>
            <p className={`mono-label ${styles.title}`}>
              {dictionary.stack.groups[groupId]}
            </p>
            <ul className={styles.chips}>
              {stackGroups[groupId].map((techId) => (
                <li key={techId} className={styles.chip}>
                  <TechIcon id={techId} showLabel />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className={styles.more}>
          <p className={`mono-label ${styles.title}`}>{dictionary.stack.moreLabel}</p>
          <ul className={styles.chips}>
            {moreSkills.map((techId) => (
              <li key={techId} className={styles.chip}>
                <TechIcon id={techId} showLabel />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
