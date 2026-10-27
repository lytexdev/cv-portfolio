'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import styles from '../sudo.module.css'

type Entry = {
  key: string
  de: string
  en: string
}

type Props = {
  entries: Entry[]
  initialKey?: string
  csrf: string
  savePairAction: (formData: FormData) => void | Promise<void>
  translateAction: (formData: FormData) => void | Promise<void>
}

function draftsFromEntries(entries: Entry[]) {
  const initial: Record<string, { de: string; en: string }> = {}
  for (const entry of entries) {
    initial[entry.key] = { de: entry.de, en: entry.en }
  }
  return initial
}

export function ContentEditor({
  entries,
  initialKey,
  csrf,
  savePairAction,
  translateAction,
}: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(
    initialKey && entries.some((e) => e.key === initialKey)
      ? initialKey
      : (entries[0]?.key ?? ''),
  )
  const [pending, startTransition] = useTransition()
  const [drafts, setDrafts] = useState(() => draftsFromEntries(entries))

  useEffect(() => {
    if (initialKey && entries.some((e) => e.key === initialKey)) {
      setSelected(initialKey)
    }
  }, [entries, initialKey])

  useEffect(() => {
    setDrafts(draftsFromEntries(entries))
  }, [entries])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => e.key.toLowerCase().includes(q))
  }, [entries, query])

  const current = entries.find((e) => e.key === selected)
  const de = drafts[selected]?.de ?? current?.de ?? ''
  const en = drafts[selected]?.en ?? current?.en ?? ''

  const selectKey = (key: string) => {
    setSelected(key)
    setDrafts((prev) => {
      if (prev[key]) return prev
      const next = entries.find((e) => e.key === key)
      return {
        ...prev,
        [key]: { de: next?.de ?? '', en: next?.en ?? '' },
      }
    })
  }

  const setDe = (value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [selected]: { de: value, en: prev[selected]?.en ?? current?.en ?? '' },
    }))
  }

  const setEn = (value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [selected]: { de: prev[selected]?.de ?? current?.de ?? '', en: value },
    }))
  }

  return (
    <div className={styles.split}>
      <aside className={styles.sideList}>
        <label className={styles.label}>
          Search keys
          <input
            className={styles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="hero.ctaPrint"
          />
        </label>
        <ul className={styles.keyList}>
          {filtered.map((entry) => (
            <li key={entry.key}>
              <button
                type="button"
                className={`${styles.keyItem} ${
                  entry.key === selected ? styles.keyItemActive : ''
                }`}
                onClick={() => selectKey(entry.key)}
              >
                {entry.key}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className={styles.editorPane}>
        {current ? (
          <>
            <h2 className={styles.title}>{selected}</h2>
            <div className={styles.localeSplit}>
              <label className={styles.label}>
                Deutsch
                <textarea
                  key={`${selected}:de`}
                  className={styles.textareaTall}
                  value={de}
                  onChange={(event) => setDe(event.target.value)}
                />
              </label>
              <label className={styles.label}>
                English
                <textarea
                  key={`${selected}:en`}
                  className={styles.textareaTall}
                  value={en}
                  onChange={(event) => setEn(event.target.value)}
                />
              </label>
            </div>
            <div className={styles.toolbar}>
              <button
                type="button"
                className={styles.button}
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const data = new FormData()
                    data.set('csrf', csrf)
                    data.set('key', selected)
                    data.set('value_de', de)
                    data.set('value_en', en)
                    await savePairAction(data)
                  })
                }}
              >
                Save DE + EN
              </button>
              <button
                type="button"
                className={styles.buttonGhost}
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const data = new FormData()
                    data.set('csrf', csrf)
                    data.set('key', selected)
                    data.set('value_de', de)
                    await translateAction(data)
                  })
                }}
              >
                Translate DE → EN
              </button>
            </div>
          </>
        ) : (
          <p className={styles.muted}>No content keys available.</p>
        )}
      </div>
    </div>
  )
}
