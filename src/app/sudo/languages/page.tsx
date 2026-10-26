import { de } from '@/content/de'
import { languageLevels, spokenLanguageCodes } from '@/content/shared'
import { createCsrfToken } from '@/lib/server/csrf'
import { getSpokenLanguages } from '@/lib/server/settings'
import { ensureAdminOrRedirect, saveSpokenLanguagesAction } from '../actions'
import { AdminNav } from '../_components/AdminNav'
import styles from '../sudo.module.css'

type Props = {
  searchParams: Promise<{ saved?: string }>
}

export default async function LanguagesAdminPage({ searchParams }: Props) {
  const session = await ensureAdminOrRedirect()
  const csrf = await createCsrfToken(String(session.adminId))
  const languages = getSpokenLanguages()
  const query = await searchParams
  const rows = [
    ...languages,
    ...Array.from({ length: spokenLanguageCodes.length - languages.length }, () => ({
      code: '',
      level: '',
    })),
  ]

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <h1 className={styles.title}>Languages</h1>
      <p className={styles.muted}>
        Spoken languages shown as flags in the whoami section, in this order. Rows without a level
        are ignored, duplicate languages keep the first row.
      </p>
      {query.saved ? <p className={`${styles.flash} ${styles.flashOk}`}>Languages saved.</p> : null}

      <form action={saveSpokenLanguagesAction} className={styles.card}>
        <input type="hidden" name="csrf" value={csrf} />
        <div className={styles.grid}>
          {rows.map((row, index) => (
            <div key={`language-${index}`} className={styles.grid2}>
              <label className={styles.label}>
                Language
                <select className={styles.select} name="languageCode" defaultValue={row.code}>
                  <option value="">-</option>
                  {spokenLanguageCodes.map((code) => (
                    <option key={code} value={code}>
                      {de.more.languageNames[code]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                Level
                <select className={styles.select} name="languageLevel" defaultValue={row.level}>
                  <option value="">-</option>
                  {languageLevels.map((level) => (
                    <option key={level} value={level}>
                      {de.more.languageLevels[level]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
        <div className={styles.toolbar}>
          <button className={styles.button} type="submit">
            Save languages
          </button>
        </div>
      </form>
    </div>
  )
}
