import { tokenStats, listTokens } from '@/lib/server/tokens'
import { listDbProjects, listDbExperiences } from '@/lib/server/content-db'
import { ensureAdminOrRedirect } from './actions'
import { AdminNav } from './_components/AdminNav'
import styles from './sudo.module.css'

export default async function SudoDashboardPage() {
  await ensureAdminOrRedirect()
  const stats = tokenStats()
  const tokens = listTokens().slice(0, 5)
  const projects = listDbProjects().length
  const experience = listDbExperiences().length

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <h1 className={styles.title}>Dashboard</h1>
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
        <h2 className={styles.title}>Recent tokens</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Views</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.id}>
                <td>{t.label}</td>
                <td>{t.viewCount}</td>
                <td>{t.revoked ? 'revoked' : 'active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
