import { createCsrfToken } from '@/lib/server/csrf'
import { getStackConfig } from '@/lib/server/settings'
import { ensureAdminOrRedirect, saveStackConfigAction } from '../actions'
import { AdminNav } from '../_components/AdminNav'
import { TechIdReference } from '../_components/TechIdReference'
import styles from '../sudo.module.css'

type Props = {
  searchParams: Promise<{ saved?: string }>
}

export default async function StackAdminPage({ searchParams }: Props) {
  const session = await ensureAdminOrRedirect()
  const csrf = await createCsrfToken(String(session.adminId))
  const config = getStackConfig()
  const query = await searchParams

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <h1 className={styles.title}>Tech stack</h1>
      <p className={styles.muted}>
        Comma-separated tech IDs (e.g. typescript, react, docker). Used by the Stack and More
        sections. Unknown IDs are dropped on save.
      </p>
      {query.saved ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Stack saved.</p>
      ) : null}

      <form action={saveStackConfigAction} className={styles.card}>
        <input type="hidden" name="csrf" value={csrf} />
        <div className={styles.grid}>
          {Object.entries(config.groups).map(([group, ids]) => (
            <label key={group} className={styles.label}>
              Group: {group}
              <input
                className={styles.input}
                name={`group_${group}`}
                defaultValue={ids.join(', ')}
              />
            </label>
          ))}
          <label className={styles.label}>
            More skills
            <input
              className={styles.input}
              name="moreSkills"
              defaultValue={config.moreSkills.join(', ')}
            />
          </label>
          <label className={styles.label}>
            Daily driver
            <input
              className={styles.input}
              name="dailyDriver"
              defaultValue={config.dailyDriver.join(', ')}
            />
          </label>
        </div>
        <div className={styles.toolbar}>
          <button className={styles.button} type="submit">
            Save stack
          </button>
        </div>
      </form>
      <TechIdReference />
    </div>
  )
}
