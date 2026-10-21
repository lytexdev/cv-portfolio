import { createCsrfToken } from '@/lib/server/csrf'
import { listContentStrings } from '@/lib/server/content-db'
import {
  ensureAdminOrRedirect,
  saveContentPairAction,
  translateContentAction,
} from '../actions'
import { AdminNav } from '../_components/AdminNav'
import { ContentEditor } from '../_components/ContentEditor'
import styles from '../sudo.module.css'

const EDITABLE_PREFIXES = [
  'meta.',
  'role',
  'summary',
  'availability',
  'hero.',
  'footer.',
  'contact.',
  'terminal.',
]

type Props = {
  searchParams: Promise<{ key?: string; saved?: string; translated?: string }>
}

export default async function ContentAdminPage({ searchParams }: Props) {
  const session = await ensureAdminOrRedirect()
  const csrf = await createCsrfToken(String(session.adminId))
  const all = listContentStrings()
  const keys = [...new Set(all.map((r) => r.key))]
    .filter((key) => EDITABLE_PREFIXES.some((p) => key === p || key.startsWith(p)))
    .sort()
  const query = await searchParams
  const entries = keys.map((key) => ({
    key,
    de: all.find((r) => r.key === key && r.locale === 'de')?.value ?? '',
    en: all.find((r) => r.key === key && r.locale === 'en')?.value ?? '',
  }))

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <h1 className={styles.title}>Content strings</h1>
      {query.saved ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Saved.</p>
      ) : null}
      {query.translated ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Translated DE → EN.</p>
      ) : null}

      <ContentEditor
        entries={entries}
        initialKey={query.key}
        csrf={csrf}
        savePairAction={saveContentPairAction}
        translateAction={translateContentAction}
      />
    </div>
  )
}
