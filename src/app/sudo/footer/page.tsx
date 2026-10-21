import { createCsrfToken } from '@/lib/server/csrf'
import { SOCIAL_PLATFORMS, getFooterConfig } from '@/lib/server/settings'
import { ensureAdminOrRedirect, saveFooterConfigAction } from '../actions'
import { AdminNav } from '../_components/AdminNav'
import styles from '../sudo.module.css'

type Props = {
  searchParams: Promise<{ saved?: string }>
}

const PLATFORM_LABELS: Record<(typeof SOCIAL_PLATFORMS)[number], string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  spotify: 'Spotify',
  discord: 'Discord',
}

export default async function FooterAdminPage({ searchParams }: Props) {
  const session = await ensureAdminOrRedirect()
  const csrf = await createCsrfToken(String(session.adminId))
  const config = getFooterConfig()
  const query = await searchParams
  const rows = [
    ...config.socials,
    ...Array.from({ length: Math.max(0, 6 - config.socials.length) }, () => ({
      platform: 'github' as const,
      url: '',
      label: '',
    })),
  ]

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <h1 className={styles.title}>Footer</h1>
      <p className={styles.muted}>
        Tagline, legal links, version line, and social channels shown on the CV footer.
      </p>
      {query.saved ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Footer saved.</p>
      ) : null}

      <form action={saveFooterConfigAction} className={styles.card}>
        <input type="hidden" name="csrf" value={csrf} />
        <div className={styles.grid}>
          <label className={styles.label}>
            Tagline (DE)
            <input
              className={styles.input}
              name="taglineDe"
              defaultValue={config.taglineDe}
            />
          </label>
          <label className={styles.label}>
            Tagline (EN)
            <input
              className={styles.input}
              name="taglineEn"
              defaultValue={config.taglineEn}
            />
          </label>
          <label className={styles.label}>
            Imprint URL
            <input
              className={styles.input}
              name="imprintUrl"
              type="url"
              defaultValue={config.imprintUrl}
              placeholder="https://"
            />
          </label>
          <label className={styles.label}>
            Privacy URL
            <input
              className={styles.input}
              name="privacyUrl"
              type="url"
              defaultValue={config.privacyUrl}
              placeholder="https://"
            />
          </label>
          <label className={styles.label}>
            Repository URL
            <input
              className={styles.input}
              name="repoUrl"
              type="url"
              defaultValue={config.repoUrl}
              placeholder="https://github.com/..."
            />
          </label>
          <label className={styles.label}>
            <span>
              <input
                type="checkbox"
                name="showVersion"
                defaultChecked={config.showVersion}
              />{' '}
              Show version / build
            </span>
          </label>
        </div>

        <h2 className={styles.subtitle}>Social links</h2>
        <p className={styles.muted}>
          Empty URL rows are ignored. Label is used as display text and tooltip.
        </p>
        <div className={styles.grid}>
          {rows.map((row, index) => (
            <div key={`social-${index}`} className={styles.card}>
              <label className={styles.label}>
                Platform
                <select
                  className={styles.input}
                  name="socialPlatform"
                  defaultValue={row.platform}
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {PLATFORM_LABELS[platform]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                URL
                <input
                  className={styles.input}
                  name="socialUrl"
                  type="url"
                  defaultValue={row.url}
                  placeholder="https://"
                />
              </label>
              <label className={styles.label}>
                Label
                <input
                  className={styles.input}
                  name="socialLabel"
                  defaultValue={row.label}
                  placeholder={PLATFORM_LABELS[row.platform]}
                />
              </label>
            </div>
          ))}
        </div>

        <div className={styles.toolbar}>
          <button className={styles.button} type="submit">
            Save footer
          </button>
        </div>
      </form>
    </div>
  )
}
