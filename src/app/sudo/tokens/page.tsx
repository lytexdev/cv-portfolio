import { createCsrfToken } from '@/lib/server/csrf'
import { getEnv } from '@/lib/server/env'
import { listTokens } from '@/lib/server/tokens'
import {
  createTokenAction,
  deleteTokenAction,
  ensureAdminOrRedirect,
  revokeTokenAction,
  updateTokenAction,
} from '../actions'
import { AdminNav } from '../_components/AdminNav'
import { ConfirmForm } from '../_components/ConfirmForm'
import styles from '../sudo.module.css'

type Props = {
  searchParams: Promise<{ created?: string; error?: string }>
}

export default async function TokensPage({ searchParams }: Props) {
  const session = await ensureAdminOrRedirect()
  const csrf = await createCsrfToken(String(session.adminId))
  const tokens = listTokens()
  const query = await searchParams
  const base = getEnv().publicBaseUrl

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <h1 className={styles.title}>Tokens</h1>
      {query.created ? (
        <div className={`${styles.flash} ${styles.flashOk}`}>
          <p className={styles.ok} style={{ margin: 0 }}>
            Token created. Copy it now. It will not be shown again.
          </p>
          <p className={styles.createdToken}>{query.created}</p>
          <p className={styles.muted} style={{ margin: 0 }}>
            {base}/de?k={query.created}
          </p>
        </div>
      ) : null}
      {query.error ? (
        <p className={`${styles.flash} ${styles.flashError}`}>Label required.</p>
      ) : null}

      <div className={styles.card}>
        <h2 className={styles.title}>Create token</h2>
        <form action={createTokenAction} className={styles.grid2}>
          <input type="hidden" name="csrf" value={csrf} />
          <label className={styles.label}>
            Label
            <input className={styles.input} name="label" required />
          </label>
          <label className={styles.label}>
            Role
            <input className={styles.input} name="role" placeholder="Frontend Developer" />
          </label>
          <label className={styles.label}>
            Expires (optional ISO date)
            <input
              className={styles.input}
              name="expiresAt"
              type="datetime-local"
            />
          </label>
          <div className={styles.toolbar} style={{ border: 0, margin: 0, padding: 0 }}>
            <button className={styles.button} type="submit">
              Create token
            </button>
          </div>
        </form>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Token</th>
              <th>Details</th>
              <th>Views</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.id}>
                <td>
                  <code>{t.id}</code>
                  <div style={{ marginTop: 6 }}>
                    <span
                      className={`${styles.badge} ${
                        t.revoked ? styles.badgeWarn : styles.badgeOk
                      }`}
                    >
                      {t.revoked ? 'revoked' : 'active'}
                    </span>
                  </div>
                </td>
                <td>
                  <form action={updateTokenAction} className={styles.grid}>
                    <input type="hidden" name="csrf" value={csrf} />
                    <input type="hidden" name="id" value={t.id} />
                    <label className={styles.label}>
                      Label
                      <input className={styles.input} name="label" defaultValue={t.label} />
                    </label>
                    <label className={styles.label}>
                      Role
                      <input className={styles.input} name="role" defaultValue={t.role ?? ''} />
                    </label>
                    <label className={styles.label}>
                      Expires
                      <input
                        className={styles.input}
                        name="expiresAt"
                        defaultValue={t.expiresAt ?? ''}
                        placeholder="2027-01-01T00:00:00.000Z"
                      />
                    </label>
                    <button className={styles.button} type="submit">
                      Save changes
                    </button>
                  </form>
                </td>
                <td>{t.viewCount}</td>
                <td>
                  <div className={styles.tokenActions}>
                    <ConfirmForm
                      action={revokeTokenAction}
                      title="Revoke token?"
                      message={`Revoke "${t.label}"? Links with this token will stop working.`}
                      confirmLabel="Revoke"
                    >
                      <input type="hidden" name="csrf" value={csrf} />
                      <input type="hidden" name="id" value={t.id} />
                      <button className={styles.buttonGhost} type="submit">
                        Revoke
                      </button>
                    </ConfirmForm>
                    <ConfirmForm
                      action={deleteTokenAction}
                      title="Delete token permanently?"
                      message={`Delete "${t.label}" (${t.id})? This cannot be undone.`}
                      confirmLabel="Delete forever"
                    >
                      <input type="hidden" name="csrf" value={csrf} />
                      <input type="hidden" name="id" value={t.id} />
                      <button
                        className={`${styles.button} ${styles.buttonDanger}`}
                        type="submit"
                      >
                        Delete
                      </button>
                    </ConfirmForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
