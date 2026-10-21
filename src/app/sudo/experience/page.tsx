import Link from 'next/link'
import { createCsrfToken } from '@/lib/server/csrf'
import { listDbExperiences } from '@/lib/server/content-db'
import {
  deleteExperienceAction,
  ensureAdminOrRedirect,
  saveExperienceAction,
  translateExperienceAction,
} from '../actions'
import { AdminNav } from '../_components/AdminNav'
import { ConfirmForm } from '../_components/ConfirmForm'
import { LocaleTabs } from '../_components/LocaleTabs'
import styles from '../sudo.module.css'

type Props = {
  searchParams: Promise<{ edited?: string; saved?: string; translated?: string; new?: string }>
}

export default async function ExperienceAdminPage({ searchParams }: Props) {
  const session = await ensureAdminOrRedirect()
  const csrf = await createCsrfToken(String(session.adminId))
  const items = listDbExperiences()
  const query = await searchParams
  const creating = query.new === '1'
  const editing = creating
    ? null
    : (items.find((e) => e.id === query.edited) ?? items[0] ?? null)

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <div className={styles.buttonRow} style={{ marginBottom: '1rem' }}>
        <h1 className={styles.title} style={{ margin: 0, flex: 1 }}>
          Experience
        </h1>
        <Link className={styles.button} href="/sudo/experience?new=1">
          New entry
        </Link>
      </div>

      {query.translated ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Translated to EN via DeepL.</p>
      ) : null}
      {query.saved ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Experience saved.</p>
      ) : null}

      <div className={styles.split}>
        <aside className={styles.sideList}>
          {items.map((e) => {
            const active = !creating && editing?.id === e.id
            return (
              <Link
                key={e.id}
                href={`/sudo/experience?edited=${encodeURIComponent(e.id)}`}
                className={`${styles.sideItem} ${active ? styles.sideItemActive : ''}`}
              >
                <span className={styles.sideItemTitle}>{e.role.de || e.id}</span>
                <span className={styles.muted}>
                  {e.company.de} · sort {e.sortOrder}
                </span>
              </Link>
            )
          })}
        </aside>

        <div className={styles.editorPane}>
          <h2 className={styles.title}>
            {editing ? `Edit · ${editing.id}` : 'New experience'}
          </h2>

          <form action={saveExperienceAction} className={styles.grid}>
            <input type="hidden" name="csrf" value={csrf} />

            <p className={styles.sectionLabel}>Meta</p>
            <div className={styles.grid2}>
              <label className={styles.label}>
                ID
                <input
                  className={styles.input}
                  name="id"
                  required
                  defaultValue={editing?.id ?? ''}
                  readOnly={Boolean(editing)}
                />
              </label>
              <label className={styles.label}>
                Sort
                <input
                  className={styles.input}
                  name="sortOrder"
                  type="number"
                  defaultValue={editing?.sortOrder ?? items.length}
                />
              </label>
              <label className={styles.label}>
                Start
                <input
                  className={styles.input}
                  name="start"
                  type="date"
                  required
                  defaultValue={editing?.start?.slice(0, 10) ?? ''}
                />
              </label>
              <label className={styles.label}>
                End (empty = current)
                <input
                  className={styles.input}
                  name="end"
                  type="date"
                  defaultValue={editing?.end?.slice(0, 10) ?? ''}
                />
              </label>
              <label className={styles.label}>
                Stack IDs
                <input
                  className={styles.input}
                  name="stack"
                  defaultValue={editing?.stack.join(', ') ?? ''}
                />
              </label>
              <label className={styles.label}>
                Project links
                <input
                  className={styles.input}
                  name="projectLinks"
                  defaultValue={editing?.projectLinks.join(', ') ?? ''}
                />
              </label>
            </div>

            <p className={styles.sectionLabel}>Copy</p>
            <LocaleTabs
              de={
                <>
                  <label className={styles.label}>
                    Role
                    <input
                      className={styles.input}
                      name="role_de"
                      defaultValue={editing?.role.de ?? ''}
                      required
                    />
                  </label>
                  <label className={styles.label}>
                    Company
                    <input
                      className={styles.input}
                      name="company_de"
                      defaultValue={editing?.company.de ?? ''}
                      required
                    />
                  </label>
                  <label className={styles.label}>
                    Location
                    <input
                      className={styles.input}
                      name="location_de"
                      defaultValue={editing?.location.de ?? ''}
                    />
                  </label>
                  <label className={styles.label}>
                    Highlights (one per line; **bold**, *italic*, &lt;icon-github&gt;)
                    <textarea
                      className={styles.textarea}
                      name="highlights_de"
                      defaultValue={editing?.highlights.de.join('\n') ?? ''}
                    />
                  </label>
                </>
              }
              en={
                <>
                  <label className={styles.label}>
                    Role
                    <input
                      className={styles.input}
                      name="role_en"
                      defaultValue={editing?.role.en ?? ''}
                    />
                  </label>
                  <label className={styles.label}>
                    Company
                    <input
                      className={styles.input}
                      name="company_en"
                      defaultValue={editing?.company.en ?? ''}
                    />
                  </label>
                  <label className={styles.label}>
                    Location
                    <input
                      className={styles.input}
                      name="location_en"
                      defaultValue={editing?.location.en ?? ''}
                    />
                  </label>
                  <label className={styles.label}>
                    Highlights (one per line; **bold**, *italic*, &lt;icon-github&gt;)
                    <textarea
                      className={styles.textarea}
                      name="highlights_en"
                      defaultValue={editing?.highlights.en.join('\n') ?? ''}
                    />
                  </label>
                </>
              }
            />

            <div className={styles.toolbar}>
              <button className={styles.button} type="submit">
                Save
              </button>
            </div>
          </form>

          {editing ? (
            <>
              <form action={translateExperienceAction} className={styles.toolbar}>
                <input type="hidden" name="csrf" value={csrf} />
                <input type="hidden" name="id" value={editing.id} />
                <button className={styles.buttonGhost} type="submit">
                  Translate DE → EN
                </button>
              </form>
              <div className={styles.toolbar}>
                <ConfirmForm
                  action={deleteExperienceAction}
                  title="Delete experience?"
                  message={`Delete "${editing.role.de || editing.id}"? This cannot be undone.`}
                  confirmLabel="Delete entry"
                >
                  <input type="hidden" name="csrf" value={csrf} />
                  <input type="hidden" name="id" value={editing.id} />
                  <button className={`${styles.button} ${styles.buttonDanger}`} type="submit">
                    Delete entry
                  </button>
                </ConfirmForm>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
