import { listAuditLogs, type AuditCategory } from '@/lib/server/audit'
import { ensureAdminOrRedirect } from '../actions'
import { AdminNav } from '../_components/AdminNav'
import styles from '../sudo.module.css'

type Props = {
  searchParams: Promise<{ category?: string }>
}

const CATEGORIES: Array<AuditCategory | 'all'> = [
  'all',
  'security',
  'honeypot',
  'auth',
  'admin',
  'viewer',
]

export default async function LogsPage({ searchParams }: Props) {
  await ensureAdminOrRedirect()
  const query = await searchParams
  const category =
    query.category && CATEGORIES.includes(query.category as AuditCategory)
      ? (query.category as AuditCategory)
      : undefined
  const logs = listAuditLogs({
    category,
    limit: 250,
  })

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <h1 className={styles.title}>Logs</h1>
      <p className={styles.muted}>
        Security, honeypot, auth, admin, and viewer events stored in SQLite.
      </p>
      <div className={styles.buttonRow} style={{ marginBottom: '1rem' }}>
        {CATEGORIES.map((item) => (
          <a
            key={item}
            className={item === (category ?? 'all') ? styles.button : styles.buttonGhost}
            href={item === 'all' ? '/sudo/logs' : `/sudo/logs?category=${item}`}
          >
            {item}
          </a>
        ))}
      </div>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Category</th>
              <th>Event</th>
              <th>Detail</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.muted}>
                  No log entries yet.
                </td>
              </tr>
            ) : (
              logs.map((row) => (
                <tr key={row.id}>
                  <td>
                    <code>{row.createdAt}</code>
                  </td>
                  <td>{row.category}</td>
                  <td>{row.event}</td>
                  <td>{row.detail ?? '-'}</td>
                  <td>{row.ip ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
