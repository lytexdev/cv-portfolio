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
import { setThemeValue } from './ThemeToggle'
import styles from './MiniTerminal.module.css'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: Locale
  dictionary: CvDictionary
  age: number | null
  hasToken: boolean
  token?: string
  phone?: string
  onOpenProject: (slug: ProjectSlug) => void
}

type Line = { text: string; tone?: 'out' | 'err' | 'info' | 'cmd' }

const COMMAND_LIST = [
  'help',
  'h',
  'fish',
  'bash',
  'whoami',
  'cat about.txt',
  'ls',
  'ls -la',
  'la',
  'ls projects',
  'cd',
  'open',
  'skills',
  'contact',
  'ask',
  'neofetch',
  'htop',
  'tldr',
  'ping',
  'generate_password',
  'ssh',
  'sudo',
  'theme',
  'lang',
  'clear',
  'exit',
] as const

const VFS: Record<string, string[]> = {
  '~': ['about.txt', 'projects', 'contact.txt', 'skills.md'],
  '~/projects': [...featuredProjectOrder, ...compactProjectOrder],
}

const ARCH_ART = [
  '                   -`',
  '                  .o+`',
  '                 `ooo/',
  '                `+oooo:',
  '               `+oooooo:',
  '               -+oooooo+:',
  '             `/:-:++oooo+:',
  '            `/++++/+++++++:',
  '           `/++++++++++++++:',
  '          `/+++ooooooooooooo/`',
  '         ./ooosssso++osssssso+`',
  '        .oossssso-````/ossssss+`',
  '       -osssssso.      :ssssssso.',
  '      :osssssss/        osssso+++.',
  '     /ossssssss/        +ssssooo/-',
  '   `/ossssso+/:-        -:/+osssso+-',
  '  `+sso+:-`                 `.-/+oso:',
  ' `++:.                           `-/+/',
  ' .`                                 `/',
]

function generatePassword(length: number): string {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

export function MiniTerminal({
  open,
  onOpenChange,
  locale,
  dictionary,
  age,
  hasToken,
  token,
  phone,
  onOpenProject,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<Line[]>([
    { text: 'Welcome to fish, the friendly interactive shell.', tone: 'info' },
    { text: 'Type help for commands.', tone: 'info' },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [cwd, setCwd] = useState('~')
  const [shell, setShell] = useState<'fish' | 'bash'>('fish')
  const [busy, setBusy] = useState(false)
  const [maximized, setMaximized] = useState(false)

  const projectSlugs = useMemo(
    () => [...featuredProjectOrder, ...compactProjectOrder],
    [],
  )

  const prompt = `immanuel@lytex ${cwd}>`

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

  const append = (next: Line | Line[] | string | string[], tone: Line['tone'] = 'out') => {
    const items: Line[] = Array.isArray(next)
      ? next.map((n) => (typeof n === 'string' ? { text: n, tone } : n))
      : typeof next === 'string'
        ? [{ text: next, tone }]
        : [next]
    setLines((prev) => [...prev, ...items])
  }

  const hint = locale === 'de' ? 'Hinweis: help' : 'Hint: help'

  const run = (raw: string) => {
    if (busy) return
    const input = raw.trim()
    append({ text: `${prompt} ${input}`, tone: 'cmd' })
    if (!input) return

    setHistory((prev) => [...prev, input])
    setHistoryIndex(-1)

    const parts = input.split(/\s+/)
    let cmd = parts[0]
    let rest = parts.slice(1)
    if (cmd === 'h') cmd = 'help'
    if (cmd === 'la') {
      cmd = 'ls'
      rest = ['-la', ...rest]
    }

    const arg = rest.join(' ')

    if (cmd === 'help') {
      append(
        [
          'Navigation & CV',
          '  whoami · cat about.txt · ls / ls -la / la · cd · open <slug>',
          '  skills · contact · ask <question> · neofetch · theme · lang',
          'Shell toys',
          '  fish · bash · htop · tldr <cmd> · ping <host>',
          '  generate_password [len] · ssh root@vserver',
          '  sudo [-i|pacman -Syu|apt update]',
          '  clear · exit · h (alias help)',
        ].join('\n'),
        'info',
      )
      return
    }

    if (cmd === 'fish') {
      setShell('fish')
      append(
        [
          'Welcome to fish, the friendly interactive shell',
          'Type help for a list of commands.',
        ].join('\n'),
        'info',
      )
      return
    }

    if (cmd === 'bash') {
      setShell('bash')
      append('GNU bash, version 5.2.37(1)-release (x86_64-pc-linux-gnu)', 'info')
      return
    }

    if (cmd === 'whoami') {
      append(`${person.name}\n${dictionary.role}\n${person.city}`)
      return
    }

    if (cmd === 'cat' && (arg === 'about.txt' || (cwd === '~' && arg === 'about.txt'))) {
      append(dictionary.summary)
      return
    }

    if (cmd === 'ls') {
      const long = rest.includes('-la') || rest.includes('-l') || rest.includes('-a')
      const target = rest.find((r) => !r.startsWith('-')) || ''
      if (target === 'projects' || (cwd === '~/projects' && !target)) {
        append(long ? projectSlugs.map((s) => `-rw-r--r-- 1 immanuel users 4K ${s}`).join('\n') : projectSlugs.join('\n'))
        return
      }
      const listing = VFS[cwd] ?? VFS['~'] ?? []
      append(
        long
          ? listing.map((name) => `drwxr-xr-x 1 immanuel users 4K ${name}`).join('\n')
          : listing.join('  '),
      )
      return
    }

    if (cmd === 'cd') {
      const dest = arg || '~'
      if (dest === '~' || dest === '/') {
        setCwd('~')
        return
      }
      if (dest === 'projects' || dest === '~/projects' || dest === './projects') {
        setCwd('~/projects')
        return
      }
      if (dest === '..') {
        setCwd(cwd.includes('/') ? cwd.replace(/\/[^/]+$/, '') || '~' : '~')
        return
      }
      append(`cd: The directory '${dest}' does not exist`, 'err')
      return
    }

    if (cmd === 'open') {
      const slug = arg as ProjectSlug
      if (projectSlugs.includes(slug)) {
        onOpenChange(false)
        onOpenProject(slug)
      } else {
        append(`fish: Unknown command: open ${arg}\n${hint}`, 'err')
      }
      return
    }

    if (cmd === 'skills') {
      const groups = Object.entries(stackGroups).map(([group, ids]) => {
        const title =
          dictionary.stack.groups[group as keyof typeof dictionary.stack.groups]
        return `${title}: ${ids.join(', ')}`
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

    if (cmd === 'ask') {
      const question = arg.trim()
      if (!question) {
        append(
          locale === 'de'
            ? 'Usage: ask <frage>\nBeispiel: ask Welche Stacks nutzt Immanuel?'
            : 'Usage: ask <question>\nExample: ask What stack does Immanuel use?',
          'info',
        )
        return
      }
      if (!token) {
        append(
          locale === 'de'
            ? 'ask: gültiger Zugangstoken erforderlich.'
            : 'ask: a valid access token is required.',
          'err',
        )
        return
      }

      setBusy(true)
      append(locale === 'de' ? 'denke nach…' : 'thinking…', 'info')
      void (async () => {
        try {
          const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ k: token, q: question, lang: locale }),
          })
          const data = (await res.json().catch(() => null)) as
            | { answer?: string; error?: string; retryAfterSec?: number }
            | null

          if (res.status === 429) {
            const wait = data?.retryAfterSec
            append(
              locale === 'de'
                ? `ask: Rate-Limit erreicht${wait ? ` (warte ~${wait}s)` : ''}.`
                : `ask: rate limit reached${wait ? ` (retry in ~${wait}s)` : ''}.`,
              'err',
            )
            return
          }

          if (!res.ok || !data?.answer) {
            append(
              locale === 'de'
                ? 'ask: Anfrage fehlgeschlagen.'
                : 'ask: request failed.',
              'err',
            )
            return
          }

          append(data.answer)
        } catch {
          append(
            locale === 'de'
              ? 'ask: Netzwerkfehler.'
              : 'ask: network error.',
            'err',
          )
        } finally {
          setBusy(false)
        }
      })()
      return
    }

    if (cmd === 'neofetch') {
      const info = [
        'immanuel@lytex',
        '-------------',
        'OS: Arch Linux x86_64',
        'Host: Wittlich, DE',
        `Uptime: ${age ?? '?'} years`,
        `Shell: ${shell} 3.7.1`,
        'DE: KDE Plasma (Wayland)',
        'Editor: VSCodium · Cursor · Claude Code',
        'Langs: de (native), en (good)',
        'Terminal: MiniTerminal',
      ]
      const maxArt = Math.max(ARCH_ART.length, info.length)
      const rows: string[] = []
      for (let i = 0; i < maxArt; i++) {
        const left = (ARCH_ART[i] ?? '').padEnd(42, ' ')
        const right = info[i] ?? ''
        rows.push(`${left}${right}`)
      }
      append(rows.join('\n'), 'info')
      return
    }

    if (cmd === 'htop') {
      append(
        [
          '  PID USER      PRI  NI  VIRT   RES   SHR S  CPU% MEM%   TIME+  Command',
          ' 1337 immanuel   20   0  412M  88.2M 32.1M R  12.5  2.1   0:42.10 next-server',
          ' 2048 immanuel   20   0  210M  41.0M 18.4M S   3.1  1.0   0:11.04 node',
          ' 4096 immanuel   20   0  128M  22.4M 12.0M S   0.6  0.5   0:02.88 fish',
          'Mem[|||||||||||      1.2G/16.0G]  Tasks: 142 total',
          'Cpu[|||                  8.2%]   Load average: 0.42 0.38 0.31',
        ].join('\n'),
        'info',
      )
      return
    }

    if (cmd === 'tldr') {
      const topic = rest[0] || 'help'
      const pages: Record<string, string> = {
        help: 'help\n  List available MiniTerminal commands.',
        ls: 'ls\n  List files in the virtual home or projects directory.',
        cd: 'cd\n  Change virtual directory (~, projects).',
        ask: 'ask <question>\n  Ask a short question about this CV (AI, rate-limited).',
        neofetch: 'neofetch\n  Show a playful system summary.',
        ping: 'ping <host>\n  Fake latency lines to a host.',
        generate_password: 'generate_password [len]\n  CSPRNG password (default 24).',
      }
      append(pages[topic] ?? `tldr: no page for '${topic}'`, pages[topic] ? 'info' : 'err')
      return
    }

    if (cmd === 'ping') {
      const host = rest[0] || 'lytex.dev'
      setBusy(true)
      append(`PING ${host} (203.0.113.10) 56(84) bytes of data.`, 'info')
      let n = 0
      const tick = () => {
        n += 1
        const ms = (12 + Math.random() * 18).toFixed(1)
        append(`64 bytes from ${host}: icmp_seq=${n} ttl=56 time=${ms} ms`)
        if (n < 4) {
          window.setTimeout(tick, 350)
        } else {
          append(`--- ${host} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`, 'info')
          setBusy(false)
        }
      }
      window.setTimeout(tick, 200)
      return
    }

    if (cmd === 'generate_password') {
      const len = Math.min(128, Math.max(8, Number(rest[0]) || 24))
      append(generatePassword(len))
      return
    }

    if (cmd === 'ssh') {
      const target = arg || 'root@vserver'
      setBusy(true)
      append(`Connecting to ${target}...`, 'info')
      window.setTimeout(() => {
        append('nahhh… permission denied (publickey).', 'err')
        setBusy(false)
      }, 900)
      return
    }

    if (cmd === 'sudo') {
      if (arg === '-i') {
        append('immanuel is not in the sudoers file. This incident will be reported.', 'err')
        return
      }
      if (arg === 'pacman -Syu' || (rest[0] === 'pacman' && rest[1] === '-Syu')) {
        append(
          [
            ':: Synchronizing package databases...',
            ' core is up to date',
            ' extra is up to date',
            ':: Starting full system upgrade...',
            ' there is nothing to do',
          ].join('\n'),
        )
        return
      }
      if (arg === 'apt update' || (rest[0] === 'apt' && rest[1] === 'update')) {
        append(
          [
            'Hit:1 http://deb.debian.org/debian stable InRelease',
            'Reading package lists... Done',
            'Building dependency tree... Done',
            'All packages are up to date.',
          ].join('\n'),
        )
        return
      }
      append('immanuel is not in the sudoers file. This incident will be reported.', 'err')
      return
    }

    if (cmd === 'theme') {
      if (arg === 'dark' || arg === 'light') {
        setThemeValue(arg)
        append(`theme set to ${arg}`)
      } else {
        append('usage: theme dark|light', 'err')
      }
      return
    }

    if (cmd === 'lang') {
      if (arg === 'de' || arg === 'en') {
        const url = new URL(window.location.href)
        url.pathname = `/${arg}`
        window.location.assign(url.toString())
      } else {
        append('usage: lang de|en', 'err')
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

    if (cmd === 'rm' && arg === '-rf /') {
      append(
        [
          "rm: cannot remove '/': Read-only file system",
          dictionary.terminal.readOnlyNote,
        ].join('\n'),
        'err',
      )
      return
    }

    append(`fish: Unknown command: ${cmd}\n${hint}`, 'err')
  }

  const suggestion = useMemo(() => {
    const current = value
    if (!current || current.includes(' ')) return null
    const match = COMMAND_LIST.find((c) => c.startsWith(current) && c !== current)
    return match ?? null
  }, [value])

  const acceptSuggestion = () => {
    if (suggestion) {
      setValue(suggestion)
      return
    }
    const current = value.trim()
    const matches = COMMAND_LIST.filter((c) => c.startsWith(current))
    if (matches.length === 1 && matches[0]) {
      setValue(matches[0])
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${maximized ? styles.dialogMax : ''}`}
      aria-labelledby="mini-terminal-title"
      onClose={() => onOpenChange(false)}
    >
      <div className={styles.inner}>
        <div className={styles.chrome}>
          <div className={styles.traffic}>
            <button
              type="button"
              className={`${styles.trafficBtn} ${styles.trafficClose}`}
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            />
            <button
              type="button"
              className={`${styles.trafficBtn} ${styles.trafficMin}`}
              aria-label="Minimize"
              onClick={() => onOpenChange(false)}
            />
            <button
              type="button"
              className={`${styles.trafficBtn} ${styles.trafficMax}`}
              aria-label={maximized ? 'Restore' : 'Maximize'}
              onClick={() => setMaximized((v) => !v)}
            />
          </div>
          <p id="mini-terminal-title" className={styles.title}>
            {shell} - immanuel@lytex - {cwd}
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
        <div className={styles.status} aria-hidden="true">
          <span>{shell}</span>
          <span>utf-8</span>
          <span>cv.lytex.dev</span>
        </div>
        <div className={styles.log} role="log" aria-live="polite" ref={logRef}>
          {lines.map((line, index) => (
            <p
              key={`${index}-${line.text.slice(0, 16)}`}
              className={`${styles.line} ${styles[line.tone ?? 'out']}`}
            >
              {line.text}
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
          <span className={styles.prompt}>{prompt}</span>
          <div className={styles.inputWrap}>
            <span className={styles.ghost} aria-hidden="true">
              <span className={styles.ghostTyped}>{value}</span>
              <span className={styles.ghostHint}>
                {suggestion ? suggestion.slice(value.length) : ''}
              </span>
            </span>
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
                    historyIndex < 0
                      ? history.length - 1
                      : Math.max(historyIndex - 1, 0)
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
                } else if (event.key === 'Tab' || (event.key === 'ArrowRight' && suggestion)) {
                  if (suggestion || event.key === 'Tab') {
                    event.preventDefault()
                    acceptSuggestion()
                  }
                }
              }}
              aria-label="Terminal input"
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
            />
          </div>
          <span className={styles.caret} aria-hidden="true" />
        </form>
      </div>
    </dialog>
  )
}
