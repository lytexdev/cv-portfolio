import { createCsrfToken } from '@/lib/server/csrf'
import { listDbExperiences, listDbProjects } from '@/lib/server/content-db'
import { getPrivateData } from '@/lib/server/private-data'
import { getSiteProfile } from '@/lib/server/settings'
import { listTokens, revealTokenPlaintext, tokenStats } from '@/lib/server/tokens'
import {
  ensureAdminOrRedirect,
  saveSiteProfileAction,
  uploadSiteAssetAction,
} from './actions'
import { AdminNav } from './_components/AdminNav'
import styles from './sudo.module.css'

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>
}

export default async function SudoDashboardPage({ searchParams }: Props) {
  const session = await ensureAdminOrRedirect()
  const csrf = await createCsrfToken(String(session.adminId))
  const stats = tokenStats()
  const tokens = listTokens().slice(0, 5)
  const projects = listDbProjects().length
  const experience = listDbExperiences().length
  const profile = getSiteProfile()
  const privateData = getPrivateData()
  const query = await searchParams

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <h1 className={styles.title}>Dashboard</h1>
      {query.saved ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Saved.</p>
      ) : null}
      {query.error ? (
        <p className={`${styles.flash} ${styles.flashError}`}>
          Upload failed. Use JPEG, PNG or WebP up to 8 MB.
        </p>
      ) : null}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <strong>{stats.views}</strong>
          <span className={styles.muted}>Total views</span>
        </div>
        <div className={styles.stat}>
          <strong>{stats.active}</strong>
          <span className={styles.muted}>Active tokens</span>
        </div>
        <div className={styles.stat}>
          <strong>{stats.total}</strong>
          <span className={styles.muted}>All tokens</span>
        </div>
        <div className={styles.stat}>
          <strong>{projects}</strong>
          <span className={styles.muted}>Projects</span>
        </div>
        <div className={styles.stat}>
          <strong>{experience}</strong>
          <span className={styles.muted}>Experience</span>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: '1.25rem' }}>
        <h2 className={styles.title}>Profile & assets</h2>
        <form action={saveSiteProfileAction} className={styles.grid2}>
          <input type="hidden" name="csrf" value={csrf} />
          <label className={styles.label}>
            Name
            <input className={styles.input} name="name" defaultValue={profile.name} />
          </label>
          <label className={styles.label}>
            Monogram
            <input className={styles.input} name="monogram" defaultValue={profile.monogram} />
          </label>
          <label className={styles.label}>
            Email
            <input className={styles.input} name="email" defaultValue={profile.email} />
          </label>
          <label className={styles.label}>
            City
            <input className={styles.input} name="city" defaultValue={profile.city} />
          </label>
          <label className={styles.label}>
            GitHub URL
            <input className={styles.input} name="github" defaultValue={profile.github} />
          </label>
          <label className={styles.label}>
            LinkedIn URL
            <input className={styles.input} name="linkedin" defaultValue={profile.linkedin} />
          </label>
          <label className={styles.label}>
            Software since (year)
            <input
              className={styles.input}
              name="softwareSinceYear"
              type="number"
              defaultValue={profile.softwareSinceYear}
            />
          </label>
          <label className={styles.label}>
            Birth date (age)
            <input
              className={styles.input}
              name="birthDate"
              type="date"
              defaultValue={privateData?.birthDate ?? ''}
            />
          </label>
          <div className={styles.toolbar} style={{ border: 0, margin: 0, padding: 0 }}>
            <button className={styles.button} type="submit">
              Save profile
            </button>
          </div>
        </form>

        <div className={styles.grid2} style={{ marginTop: '1rem' }}>
          <form
            action={uploadSiteAssetAction}
            encType="multipart/form-data"
            className={styles.grid}
          >
            <input type="hidden" name="csrf" value={csrf} />
            <input type="hidden" name="kind" value="portrait" />
            <label className={styles.label}>
              Portrait image (JPEG, PNG, WebP · max 8 MB)
              <input
                className={styles.input}
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </label>
            {profile.portraitPath ? (
              <p className={styles.muted}>Current: {profile.portraitPath}</p>
            ) : null}
            <button className={styles.button} type="submit">
              Upload portrait
            </button>
          </form>
          <form
            action={uploadSiteAssetAction}
            encType="multipart/form-data"
            className={styles.grid}
          >
            <input type="hidden" name="csrf" value={csrf} />
            <input type="hidden" name="kind" value="logo" />
            <label className={styles.label}>
              Logo (JPEG, PNG, WebP · max 8 MB)
              <input
                className={styles.input}
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </label>
            {profile.logoPath ? (
              <p className={styles.muted}>Current: {profile.logoPath}</p>
            ) : null}
            <button className={styles.button} type="submit">
              Upload logo
            </button>
          </form>
          <form
            action={uploadSiteAssetAction}
            encType="multipart/form-data"
            className={styles.grid}
          >
            <input type="hidden" name="csrf" value={csrf} />
            <input type="hidden" name="kind" value="pdf" />
            <label className={styles.label}>
              CV PDF
              <input className={styles.input} type="file" name="file" accept="application/pdf" required />
            </label>
            {profile.cvPdfPath ? (
              <p className={styles.muted}>
                Current:{' '}
                <a href={profile.cvPdfPath} target="_blank" rel="noreferrer">
                  {profile.cvPdfPath}
                </a>
              </p>
            ) : null}
            <button className={styles.button} type="submit">
              Upload PDF
            </button>
          </form>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Recent tokens</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Views</th>
              <th>Status</th>
              <th>Token</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => {
              const plain = revealTokenPlaintext(t.id)
              return (
                <tr key={t.id}>
                  <td>{t.label}</td>
                  <td>{t.viewCount}</td>
                  <td>{t.revoked ? 'revoked' : 'active'}</td>
                  <td>
                    <code className={styles.createdToken}>
                      {plain ? `${plain.slice(0, 8)}...` : 'n/a'}
                    </code>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
