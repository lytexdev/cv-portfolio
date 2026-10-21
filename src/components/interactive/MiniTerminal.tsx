'use client'

import { IconX } from '@tabler/icons-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  compactProjectOrder,
  featuredProjectOrder,
  person,
  stackGroups,
} from '@/content/shared'
import type { CvDictionary, Locale, ProjectSlug } from '@/content/types'
import { techRegistry } from '@/components/icons/registry'
import { setThemeValue } from './ThemeToggle'
import styles from './MiniTerminal.module.css'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: Locale
  dictionary: CvDictionary
  age: number | null
  hasToken: boolean
  phone?: string
  onOpenProject: (slug: ProjectSlug) => void
}

const COMMANDS = [
  'help',
  'whoami',
  'cat about.txt',
  'ls projects',
  'open',
  'skills',
  'contact',
  'neofetch',
  'theme',
  'lang',
  'clear',
  'exit',
] as const

export function MiniTerminal({
  open,
  onOpenChange,
  locale,
  dictionary,
  age,
  hasToken,
  phone,
  onOpenProject,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<string[]>(['Type help to list commands.'])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const projectSlugs = useMemo(
    () => [...featuredProjectOrder, ...compactProjectOrder],
    [],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
      window.setTimeout(() => inputRef.current?.focus(), 0)
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [lines])

  const append = (next: string | string[]) => {
    setLines((prev) => [...prev, ...(Array.isArray(next) ? next : [next])])
  }

  const run = (raw: string) => {
    const input = raw.trim()
    append(`${dictionary.terminal.prompt} ${input}`)
    if (!input) return

    setHistory((prev) => [...prev, input])
    setHistoryIndex(-1)

    const [cmd, ...rest] = input.split(/\s+/)
    const arg = rest.join(' ')

    if (cmd === 'help') {
      append(COMMANDS.map((c) => c).join('\n'))
      return
    }
    if (cmd === 'whoami') {
      append(`${person.name}\n${dictionary.role}\n${person.city}`)
      return
    }
    if (cmd === 'cat' && arg === 'about.txt') {
      append(dictionary.summary)
      return
    }
    if (cmd === 'ls' && arg === 'projects') {
      append(projectSlugs.join('\n'))
      return
    }
    if (cmd === 'open') {
      const slug = arg as ProjectSlug
      if (projectSlugs.includes(slug)) {
        onOpenChange(false)
        onOpenProject(slug)
      } else {
        append(`fish: Unknown command: open ${arg}\n${locale === 'de' ? 'Hinweis: help' : 'Hint: help'}`)
      }
      return
    }
    if (cmd === 'skills') {
      const groups = Object.entries(stackGroups).map(([group, ids]) => {
        const title =
          dictionary.stack.groups[group as keyof typeof dictionary.stack.groups]
        const labels = ids.map((id) => techRegistry[id].label).join(', ')
        return `${title}: ${labels}`
      })
      append(groups.join('\n'))
      return
    }
    if (cmd === 'contact') {
      const parts: string[] = [person.email, person.linkedin, person.github]
      if (hasToken && phone) parts.push(phone)
      append(parts.join('\n'))
      return
    }
    if (cmd === 'neofetch') {
      append(
        [
          'immanuel@lytex',
          'OS: Arch Linux x86_64',
          'Host: Wittlich, DE',
          `Uptime: ${age ?? '?'} years`,
          'Shell: fish',
          'DE: KDE Plasma (Wayland)',
          'Editor: Cursor · Claude Code',
          'Langs: de (native), en (good)',
        ].join('\n'),
      )
      return
    }
    if (cmd === 'theme') {
      if (arg === 'dark' || arg === 'light') {
        setThemeValue(arg)
        append(`theme set to ${arg}`)
      } else {
        append('usage: theme dark|light')
      }
      return
    }
    if (cmd === 'lang') {
      if (arg === 'de' || arg === 'en') {
        const url = new URL(window.location.href)
        url.pathname = `/${arg}`
        window.location.assign(url.toString())
      } else {
        append('usage: lang de|en')
      }
      return
    }
    if (cmd === 'clear') {
      setLines([])
      return
    }
    if (cmd === 'exit') {
      onOpenChange(false)
      return
    }
    if (cmd === 'sudo') {
      append('immanuel is not in the sudoers file. This incident will be reported.')
      return
    }
    if (cmd === 'rm' && arg === '-rf /') {
      append([
        "rm: cannot remove '/': Read-only file system",
        dictionary.terminal.readOnlyNote,
      ])
      return
    }
    if (cmd === 'pacman' && arg === '-Syu') {
      append([
        ':: Synchronizing package databases...',
        ':: Starting full system upgrade...',
        ' there is nothing to do',
      ])
      return
    }

    append(
      `fish: Unknown command: ${cmd}\n${locale === 'de' ? 'Hinweis: help' : 'Hint: help'}`,
    )
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="mini-terminal-title"
      onClose={() => onOpenChange(false)}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <p id="mini-terminal-title" className="mono-label">
            {dictionary.terminal.open}
          </p>
          <button
            type="button"
            className={styles.close}
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <IconX size={18} stroke={1.75} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.log} role="log" aria-live="polite" ref={logRef}>
          {lines.map((line, index) => (
            <p key={`${index}-${line.slice(0, 12)}`} className={styles.line}>
              {line}
            </p>
          ))}
        </div>
        <form
          className={styles.inputRow}
          onSubmit={(event) => {
            event.preventDefault()
            run(value)
            setValue('')
          }}
        >
          <span className={styles.prompt}>{dictionary.terminal.prompt}</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                if (history.length === 0) return
                const nextIndex =
                  historyIndex < 0 ? history.length - 1 : Math.max(historyIndex - 1, 0)
                setHistoryIndex(nextIndex)
                setValue(history[nextIndex] ?? '')
              } else if (event.key === 'ArrowDown') {
                event.preventDefault()
                if (historyIndex < 0) return
                const nextIndex = historyIndex + 1
                if (nextIndex >= history.length) {
                  setHistoryIndex(-1)
                  setValue('')
                } else {
                  setHistoryIndex(nextIndex)
                  setValue(history[nextIndex] ?? '')
                }
              } else if (event.key === 'Tab') {
                event.preventDefault()
                const match = COMMANDS.find((c) => c.startsWith(value.trim()))
                if (match) setValue(match)
              }
            }}
            aria-label="Terminal input"
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </dialog>
  )
}
