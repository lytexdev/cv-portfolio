import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandSpotify,
  IconBrandTiktok,
  IconBrandYoutube,
} from '@tabler/icons-react'
import type { CvDictionary, Locale } from '@/content/types'
import { Tooltip } from '@/components/interactive/Tooltip'
import type { FooterConfig, SocialPlatform } from '@/lib/server/settings'
import styles from './Footer.module.css'

type Props = {
  dictionary: CvDictionary
  locale: Locale
  footer: FooterConfig
  version?: string
  buildSha?: string
}

const ICONS: Record<
  SocialPlatform,
  typeof IconBrandGithub
> = {
  github: IconBrandGithub,
  linkedin: IconBrandLinkedin,
  youtube: IconBrandYoutube,
  tiktok: IconBrandTiktok,
  instagram: IconBrandInstagram,
  spotify: IconBrandSpotify,
  discord: IconBrandDiscord,
}

export function Footer({
  dictionary,
  locale,
  footer,
  version,
  buildSha,
}: Props) {
  const tagline = locale === 'en' ? footer.taglineEn : footer.taglineDe
  const imprintUrl = footer.imprintUrl || undefined
  const privacyUrl = footer.privacyUrl || undefined
  const repoUrl = footer.repoUrl?.trim() || undefined
  const socials = footer.socials.filter((s) => s.url.trim())

  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        {tagline || repoUrl ? (
          <p className={`mono-label ${styles.tagline}`}>
            {tagline || null}
            {tagline && repoUrl ? ' · ' : null}
            {repoUrl ? (
              <a
                href={repoUrl}
                className={styles.repoLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
                <span className="visually-hidden"> {dictionary.externalNewTab}</span>
              </a>
            ) : null}
          </p>
        ) : null}

        {socials.length > 0 ? (
          <ul className={styles.socials}>
            {socials.map((social) => {
              const Icon = ICONS[social.platform]
              if (!Icon) return null
              const tip = social.label || social.platform
              return (
                <li key={`${social.platform}-${social.url}`}>
                  <Tooltip label={tip}>
                    <a
                      href={social.url}
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${tip} ${dictionary.externalNewTab}`}
                    >
                      <Icon size={18} stroke={1.75} aria-hidden="true" />
                      <span>{tip}</span>
                    </a>
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        ) : null}

        <ul className={styles.links}>
          {imprintUrl ? (
            <li>
              <a href={imprintUrl} target="_blank" rel="noopener noreferrer">
                {dictionary.footer.imprint}
                <span className="visually-hidden"> {dictionary.externalNewTab}</span>
              </a>
            </li>
          ) : null}
          {privacyUrl ? (
            <li>
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                {dictionary.footer.privacy}
                <span className="visually-hidden"> {dictionary.externalNewTab}</span>
              </a>
            </li>
          ) : null}
        </ul>

        {footer.showVersion && (version || buildSha) ? (
          <p className={`mono-label ${styles.build}`}>
            {version ? `v${version}` : null}
            {version && buildSha ? ' · ' : null}
            {buildSha ? `build ${buildSha}` : null}
          </p>
        ) : null}
      </div>
    </footer>
  )
}
