import {
  IconChartDots3,
  IconCode,
  IconCurrencyBitcoin,
  IconDna,
  IconHeartHandshake,
  IconServer,
  IconShieldLock,
  IconTarget,
} from '@tabler/icons-react'
import type { CvDictionary, InterestId, StrengthId } from '@/content/types'
import { TechIcon } from '@/components/icons/TechIcon'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { getStackConfig } from '@/lib/server/settings'
import styles from './More.module.css'

const interestIcons: Record<InterestId, typeof IconCode> = {
  webdev: IconCode,
  security: IconShieldLock,
  linux: IconServer,
  biology: IconDna,
  crypto: IconCurrencyBitcoin,
}

const strengthIcons: Record<StrengthId, typeof IconCode> = {
  analytical: IconChartDots3,
  helpful: IconHeartHandshake,
  goalOriented: IconTarget,
}

type Props = {
  dictionary: CvDictionary
}

export function More({ dictionary }: Props) {
  const section = dictionary.sections.more
  const interestIds = Object.keys(dictionary.more.interests) as InterestId[]
  const strengthIds = Object.keys(dictionary.more.strengths) as StrengthId[]
  const { moreSkills, dailyDriver } = getStackConfig()

  return (
    <section id="more" className="section" aria-labelledby="more-title" data-reveal>
      <SectionHeading id="more" rail={section.rail} title={section.title} />
      <div className={styles.grid}>
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>{dictionary.more.languagesTitle}</h3>
          <ul className={styles.list}>
            {(Array.isArray(dictionary.more.languages) ? dictionary.more.languages : []).map(
              (lang) => (
                <li key={lang.name} className={styles.item}>
                  <span className={styles.langName}>{lang.name}</span>
                  <span className={styles.langLevel}>· {lang.level}</span>
                </li>
              ),
            )}
          </ul>

          <h3 className={styles.blockTitle}>{dictionary.more.interestsTitle}</h3>
          <ul className={styles.list}>
            {interestIds.map((id) => {
              const Icon = interestIcons[id]
              if (!Icon) return null
              return (
                <li key={id} className={styles.item}>
                  <Icon size={20} stroke={1.75} aria-hidden="true" />
                  <span>{dictionary.more.interests[id]}</span>
                </li>
              )
            })}
          </ul>

          <h3 className={styles.blockTitle}>{dictionary.more.strengthsTitle}</h3>
          <ul className={styles.list}>
            {strengthIds.map((id) => {
              const Icon = strengthIcons[id]
              if (!Icon) return null
              return (
                <li key={id} className={styles.item}>
                  <Icon size={20} stroke={1.75} aria-hidden="true" />
                  <span>{dictionary.more.strengths[id]}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className={styles.block}>
          <h3 className={styles.blockTitle}>{dictionary.more.moreSkillsTitle}</h3>
          <ul className={styles.chips}>
            {moreSkills.map((techId) => (
              <li key={techId} className={styles.chip}>
                <TechIcon id={techId} showLabel />
              </li>
            ))}
          </ul>

          <div className={styles.daily}>
            <p className={`mono-label ${styles.blockTitle}`}>
              {dictionary.more.dailyDriverTitle}
            </p>
            <ul className={styles.dailyList}>
              {dailyDriver.map((techId) => (
                <li key={techId} className={styles.item}>
                  <TechIcon id={techId} showLabel />
                </li>
              ))}
            </ul>
            <p className={styles.dailyTag}>{dictionary.more.dailyDriverTagline}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
