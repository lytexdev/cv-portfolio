'use client'

import { IconX } from '@tabler/icons-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { sectionOrder } from '@/content/shared'
import type { CvDictionary, Locale, SectionId } from '@/content/types'
import { useHotkey } from '@/hooks/useHotkey'
import { setThemeValue } from './ThemeToggle'
import styles from './CommandPalette.module.css'

type Item = {
  id: string
  group: 'navigation' | 'actions' | 'links'
  label: string
  keywords: string
  run: () => void
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: Locale
  dictionary: CvDictionary
  hasToken: boolean
  onOpenTerminal: () => void
  onCopyEmail: () => void
  onPrint: () => void
  onVcard: () => void
  githubUrl: string
  linkedinUrl: string
}

function rank(query: string, item: Item): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1
  const label = item.label.toLowerCase()
  const keywords = item.keywords.toLowerCase()
  if (label.startsWith(q) || keywords.startsWith(q)) return 3
  if (label.includes(q) || keywords.includes(q)) return 2
  return 0
}

export function CommandPalette({
  open,
  onOpenChange,
  locale,
  dictionary,
  hasToken,
  onOpenTerminal,
  onCopyEmail,
  onPrint,
  onVcard,
  githubUrl,
  linkedinUrl,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const closeLabel = locale === 'de' ? 'Suche schließen' : 'Close search'

  const items = useMemo<Item[]>(() => {
    const navigation: Item[] = sectionOrder.map((id: SectionId) => ({
      id: `nav-${id}`,
      group: 'navigation',
      label: dictionary.sections[id].title,
      keywords: `${dictionary.sections[id].rail} ${id}`,
      run: () => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      },
    }))

    const actions: Item[] = [
      {
        id: 'action-theme',
        group: 'actions',
        label: dictionary.palette.actions.theme,
        keywords: 'theme dark light',
        run: () => {
          const current = document.documentElement.getAttribute('data-theme')
          setThemeValue(current === 'light' ? 'dark' : 'light')
        },
      },
      {
        id: 'action-lang',
        group: 'actions',
        label: dictionary.palette.actions.lang,
        keywords: 'language de en',
        run: () => {
          const next = locale === 'de' ? 'en' : 'de'
          const url = new URL(window.location.href)
          url.pathname = `/${next}`
          window.location.assign(url.toString())
        },
      },
      {
        id: 'action-copy',
        group: 'actions',
        label: dictionary.palette.actions.copyEmail,
        keywords: 'email copy',
        run: onCopyEmail,
      },
      {
        id: 'action-print',
        group: 'actions',
        label: dictionary.palette.actions.print,
        keywords: 'pdf print',
        run: onPrint,
      },
      {
        id: 'action-terminal',
        group: 'actions',
        label: dictionary.palette.actions.terminal,
        keywords: 'terminal shell',
        run: onOpenTerminal,
      },
    ]

    if (hasToken) {
      actions.splice(4, 0, {
        id: 'action-vcard',
        group: 'actions',
        label: dictionary.palette.actions.vcard,
        keywords: 'vcard contact',
        run: onVcard,
      })
    }

    const links: Item[] = [
      {
        id: 'link-github',
        group: 'links',
        label: 'GitHub',
        keywords: 'github',
        run: () => window.open(githubUrl, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'link-linkedin',
        group: 'links',
        label: 'LinkedIn',
        keywords: 'linkedin',
        run: () => window.open(linkedinUrl, '_blank', 'noopener,noreferrer'),
      },
    ]

    return [...navigation, ...actions, ...links]
  }, [
    dictionary,
    githubUrl,
    hasToken,
    linkedinUrl,
    locale,
    onCopyEmail,
    onOpenTerminal,
    onPrint,
    onVcard,
  ])

  const filtered = useMemo(() => {
    return items
      .map((item) => ({ item, score: rank(query, item) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
  }, [items, query])

  const resetKey = `${open}:${query}`
  const [lastResetKey, setLastResetKey] = useState(resetKey)
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey)
    setActiveIndex(0)
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
      window.setTimeout(() => inputRef.current?.focus(), 0)
    } else if (dialog.open) {
      dialog.close()
      setQuery('')
    }
  }, [open])

  useHotkey({
    key: 'k',
    ctrlOrMeta: true,
    handler: () => onOpenChange(!open),
  })

  const runActive = () => {
    const item = filtered[activeIndex]
    if (!item) return
    onOpenChange(false)
    item.run()
  }

  const groups: Array<'navigation' | 'actions' | 'links'> = [
    'navigation',
    'actions',
    'links',
  ]

  let flatIndex = -1

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={() => onOpenChange(false)}
      onCancel={(event) => {
        event.preventDefault()
        onOpenChange(false)
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onOpenChange(false)
        }
      }}
      aria-label={dictionary.palette.placeholder}
    >
      <div className={styles.form}>
        <div className={styles.header}>
          <input
            ref={inputRef}
            className={styles.input}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={
              filtered[activeIndex] ? `${listId}-${filtered[activeIndex].id}` : undefined
            }
            aria-autocomplete="list"
            placeholder={dictionary.palette.placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((i) => Math.max(i - 1, 0))
              } else if (event.key === 'Enter') {
                event.preventDefault()
                runActive()
              } else if (event.key === 'Escape') {
                event.preventDefault()
                onOpenChange(false)
              }
            }}
          />
          <button
            type="button"
            className={styles.close}
            aria-label={closeLabel}
            onClick={() => onOpenChange(false)}
          >
            <IconX size={18} stroke={1.75} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.list} role="listbox" id={listId}>
          {groups.map((group) => {
            const groupItems = filtered.filter((item) => item.group === group)
            if (groupItems.length === 0) return null
            return (
              <div key={group} className={styles.group}>
                <p className={`mono-label ${styles.groupTitle}`}>
                  {dictionary.palette.groups[group]}
                </p>
                {groupItems.map((item) => {
                  flatIndex += 1
                  const index = flatIndex
                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={`${listId}-${item.id}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      data-active={index === activeIndex ? 'true' : undefined}
                      className={styles.option}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => {
                        onOpenChange(false)
                        item.run()
                      }}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </dialog>
  )
}
