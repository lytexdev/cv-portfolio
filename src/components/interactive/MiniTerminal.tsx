'use client'

import { IconX } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { techRegistry } from '@/components/icons/registry'
import type {
  CvDictionary,
  Locale,
  ProjectSlug,
  SpokenLanguage,
  StackGroupId,
  TechId,
} from '@/content/types'
import { plainText } from '@/lib/rich-text'
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
  email: string
  github: string
  linkedin: string
  personName: string
  personCity: string
  projectSlugs: ProjectSlug[]
  stackGroups: Record<StackGroupId, TechId[]>
  spokenLanguages: SpokenLanguage[]
  onOpenProject: (slug: ProjectSlug) => void
}

type Line = { text: string; tone?: 'out' | 'err' | 'info' | 'cmd' }

const COMMANDS = {
  help: { usage: 'help', about: 'List available commands. Alias: h' },
  whoami: { usage: 'whoami', about: 'Print name, role and city' },
  pwd: { usage: 'pwd', about: 'Print the current directory' },
  ls: { usage: 'ls [-la] [dir]', about: 'List files in ~ or ~/projects. Alias: la' },
  cd: { usage: 'cd [~|projects|..]', about: 'Change the current directory' },
  cat: { usage: 'cat <file>', about: 'Print about.txt, contact.txt, skills.md or a project' },
  open: { usage: 'open <slug>', about: 'Open a project in the details dialog' },
  skills: { usage: 'skills', about: 'Print the tech stack by group' },
  contact: { usage: 'contact', about: 'Print e-mail and profile links' },
  neofetch: { usage: 'neofetch', about: 'Show a system summary' },
  htop: { usage: 'htop', about: 'Show a process snapshot' },
  tldr: { usage: 'tldr <command>', about: 'Show a short help page for a command' },
  ping: { usage: 'ping [host]', about: 'Send four simulated pings (default lytex.dev)' },
  generate_password: {
    usage: 'generate_password [length]',
    about: 'Generate a random password, 8 to 128 characters (default 24)',
  },
  ssh: { usage: 'ssh [user@host]', about: 'Try to connect to a server' },
  sudo: { usage: 'sudo [-i|pacman -Syu|apt update]', about: 'Run a command as root' },
  theme: { usage: 'theme dark|light', about: 'Switch the color theme' },
  lang: { usage: 'lang de|en', about: 'Switch the page language' },
  echo: { usage: 'echo <text>', about: 'Print text' },
  history: { usage: 'history', about: 'List previously entered commands' },
  fish: { usage: 'fish', about: 'Switch to the fish shell' },
  bash: { usage: 'bash', about: 'Switch to the bash shell' },
  clear: { usage: 'clear', about: 'Clear the terminal' },
  exit: { usage: 'exit', about: 'Close the terminal' },
} as const

type CommandName = keyof typeof COMMANDS

const COMMAND_NAMES = Object.keys(COMMANDS) as CommandName[]
const ALIASES: Record<string, CommandName> = { h: 'help', la: 'ls' }

function isCommand(name: string): name is CommandName {
  return COMMAND_NAMES.some((command) => command === name)
}
const HOME_FILES = ['about.txt', 'contact.txt', 'skills.md']
const HOME_DIRS = ['projects']

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
  phone,
  email,
  github,
  linkedin,
  personName,
  personCity,
  projectSlugs,
  stackGroups,
  spokenLanguages,
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

  const prompt = `immanuel@lytex ${cwd}>`
  const hint = locale === 'de' ? 'Hinweis: help' : 'Hint: help'

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
    if (open && !busy) inputRef.current?.focus()
  }, [busy, open])

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

  const isProject = (name: string): name is ProjectSlug =>
    projectSlugs.some((slug) => slug === name)

  const resolvePath = (raw: string): string => {
    const target = raw.replace(/\/+$/, '')
    if (!target || target === '~' || target === '/' || target === '~/') return '~'
    if (target === '..') return '~'
    if (target === '.') return cwd
    const absolute = target.startsWith('~/')
      ? target
      : target.startsWith('./')
        ? `${cwd}/${target.slice(2)}`
        : `${cwd}/${target}`
    return absolute.replace('~/projects/..', '~')
  }

  const projectText = (slug: ProjectSlug): string => {
    const featured = dictionary.projects.featured[slug]
    const compact = dictionary.projects.compact[slug]
    const copy = featured ?? compact
    if (!copy) return slug
    const body = featured ? featured.summary : (compact?.oneLiner ?? '')
    const highlights = Array.isArray(copy.highlights)
      ? copy.highlights.map((item) => `- ${plainText(item)}`)
      : []
    return [`# ${plainText(copy.title)}`, plainText(body, '\n'), ...highlights]
      .filter(Boolean)
      .join('\n')
  }

  const contactLines = (): string[] => {
    const parts: string[] = [email, linkedin, github]
    if (hasToken && phone) parts.push(phone)
    return parts
  }

  const skillLines = (markdown: boolean): string[] =>
    (Object.keys(stackGroups) as StackGroupId[]).map((group) => {
      const title = dictionary.stack.groups[group]
      const labels = (stackGroups[group] ?? []).map((id) => techRegistry[id]?.label ?? id)
      return markdown ? `## ${title}\n${labels.map((l) => `- ${l}`).join('\n')}` : `${title}: ${labels.join(', ')}`
    })

  const readFile = (path: string): string | null => {
    if (path === '~/about.txt') return plainText(dictionary.summary, '\n')
    if (path === '~/contact.txt') return contactLines().join('\n')
    if (path === '~/skills.md') return skillLines(true).join('\n\n')
    const slug = path.startsWith('~/projects/') ? path.slice('~/projects/'.length) : ''
    if (isProject(slug)) return projectText(slug)
    return null
  }

  const listDir = (path: string): { name: string; dir: boolean }[] | null => {
    if (path === '~') {
      return [
        ...HOME_FILES.map((name) => ({ name, dir: false })),
        ...HOME_DIRS.map((name) => ({ name, dir: true })),
      ]
    }
    if (path === '~/projects') return projectSlugs.map((name) => ({ name, dir: false }))
    return null
  }

  const argumentCandidates = (cmd: string): string[] => {
    const here = (listDir(cwd) ?? []).map((entry) => (entry.dir ? `${entry.name}/` : entry.name))
    switch (cmd) {
      case 'open':
        return projectSlugs
      case 'cat':
        return cwd === '~'
          ? [...HOME_FILES, ...projectSlugs.map((slug) => `projects/${slug}`)]
          : here
      case 'cd':
        return cwd === '~' ? ['projects', '~'] : ['..', '~']
      case 'ls':
        return cwd === '~' ? ['-la', 'projects'] : ['-la', '..']
      case 'tldr':
        return COMMAND_NAMES
      case 'theme':
        return ['dark', 'light']
      case 'lang':
        return ['de', 'en']
      case 'sudo':
        return ['-i', 'pacman -Syu', 'apt update']
      default:
        return []
    }
  }

  const run = (raw: string) => {
    if (busy) return
    const input = raw.trim()
    append({ text: `${prompt} ${input}`, tone: 'cmd' })
    if (!input) return

    setHistory((prev) => [...prev, input])
    setHistoryIndex(-1)

    const parts = input.split(/\s+/)
    let cmd = parts[0] ?? ''
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
          '  whoami · pwd · ls [-la] · cd <dir> · cat <file> · open <slug>',
          '  skills · contact · neofetch · theme dark|light · lang de|en',
          'Shell',
          '  fish · bash · echo <text> · history · htop · ping [host]',
          '  generate_password [len] · ssh [user@host]',
          '  sudo [-i|pacman -Syu|apt update]',
          '  tldr <command> · clear · exit · h (alias help)',
          'Tab completes commands, files and project slugs.',
        ].join('\n'),
        'info',
      )
      return
    }

    if (cmd === 'fish') {
      setShell('fish')
      append(
        ['Welcome to fish, the friendly interactive shell', 'Type help for a list of commands.'].join(
          '\n',
        ),
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
      append(`${personName}\n${plainText(dictionary.role, '\n')}\n${personCity}`)
      return
    }

    if (cmd === 'pwd') {
      append(cwd.replace('~', '/home/immanuel'))
      return
    }

    if (cmd === 'echo') {
      append(arg)
      return
    }

    if (cmd === 'history') {
      append(
        [...history, input].map((entry, index) => `${String(index + 1).padStart(4)}  ${entry}`),
      )
      return
    }

    if (cmd === 'cat') {
      if (!arg) {
        append(`usage: ${COMMANDS.cat.usage}`, 'err')
        return
      }
      for (const name of rest) {
        const path = resolvePath(name)
        if (listDir(path)) {
          append(`cat: ${name}: Is a directory`, 'err')
          continue
        }
        const content = readFile(path)
        append(content ?? `cat: ${name}: No such file or directory`, content ? 'out' : 'err')
      }
      return
    }

    if (cmd === 'ls') {
      const long = rest.some((r) => r.startsWith('-') && /[la]/.test(r))
      const target = rest.find((r) => !r.startsWith('-'))
      const path = target ? resolvePath(target) : cwd
      const entries = listDir(path)
      if (!entries) {
        const file = readFile(path)
        append(
          file ? (target ?? '') : `ls: cannot access '${target}': No such file or directory`,
          file ? 'out' : 'err',
        )
        return
      }
      append(
        long
          ? entries
              .map(({ name, dir }) =>
                dir
                  ? `drwxr-xr-x 1 immanuel users 4.0K ${name}`
                  : `-rw-r--r-- 1 immanuel users 1.2K ${name}`,
              )
              .join('\n')
          : entries.map(({ name, dir }) => (dir ? `${name}/` : name)).join('  '),
      )
      return
    }

    if (cmd === 'cd') {
      const path = resolvePath(arg)
      if (listDir(path)) {
        setCwd(path)
        return
      }
      append(
        readFile(path)
          ? `cd: '${arg}' is not a directory`
          : `cd: The directory '${arg}' does not exist`,
        'err',
      )
      return
    }

    if (cmd === 'open') {
      const slug = arg.replace(/^(~\/)?projects\//, '')
      if (isProject(slug)) {
        onOpenChange(false)
        onOpenProject(slug)
        return
      }
      append(
        arg
          ? `open: no project named '${arg}'\n${projectSlugs.join('  ')}`
          : `usage: ${COMMANDS.open.usage}\n${projectSlugs.join('  ')}`,
        'err',
      )
      return
    }

    if (cmd === 'skills') {
      append(skillLines(false).join('\n'))
      return
    }

    if (cmd === 'contact') {
      append(contactLines().join('\n'))
      return
    }

    if (cmd === 'neofetch') {
      const langs = spokenLanguages.map(({ code, level }) => `${code} (${level})`).join(', ')
      const info = [
        'immanuel@lytex',
        '-------------',
        'OS: Arch Linux x86_64',
        `Host: ${personCity}`,
        `Uptime: ${age ?? '?'} years`,
        `Shell: ${shell === 'fish' ? 'fish 3.7.1' : 'bash 5.2.37'}`,
        'DE: KDE Plasma (Wayland)',
        'Editor: VSCodium · Cursor · Claude Code',
        `Langs: ${langs || '-'}`,
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
      const requested = rest[0] || 'tldr'
      const topic = ALIASES[requested] ?? requested
      const page = isCommand(topic) ? COMMANDS[topic] : null
      append(
        page ? `${topic}\n  ${page.about}\n\n  ${page.usage}` : `tldr: no page for '${topic}'\n${hint}`,
        page ? 'info' : 'err',
      )
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
          append(
            `--- ${host} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`,
            'info',
          )
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
        append(`${target}: Permission denied (publickey).`, 'err')
        setBusy(false)
      }, 900)
      return
    }

    if (cmd === 'sudo') {
      if (rest[0] === 'pacman' && rest[1] === '-Syu') {
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
      if (rest[0] === 'apt' && rest[1] === 'update') {
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
        append(`usage: ${COMMANDS.theme.usage}`, 'err')
      }
      return
    }

    if (cmd === 'lang') {
      if (arg === 'de' || arg === 'en') {
        const url = new URL(window.location.href)
        url.pathname = `/${arg}`
        window.location.assign(url.toString())
      } else {
        append(`usage: ${COMMANDS.lang.usage}`, 'err')
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
        ["rm: cannot remove '/': Read-only file system", dictionary.terminal.readOnlyNote].join(
          '\n',
        ),
        'err',
      )
      return
    }

    append(`fish: Unknown command: ${cmd}\n${hint}`, 'err')
  }

  const matchesFor = (input: string): string[] => {
    const space = input.indexOf(' ')
    if (space < 0) {
      return COMMAND_NAMES.filter((name) => name.startsWith(input))
    }
    const cmd = input.slice(0, space)
    const partial = input.slice(space + 1).trimStart()
    return argumentCandidates(cmd)
      .filter((candidate) => candidate.startsWith(partial))
      .map((candidate) => `${cmd} ${candidate}`)
  }

  const suggestion = value ? (matchesFor(value).find((match) => match !== value) ?? null) : null

  const acceptSuggestion = () => {
    const matches = matchesFor(value).filter((match) => match !== value)
    if (matches.length === 0) return
    if (matches.length === 1 && matches[0]) {
      setValue(matches[0])
      return
    }
    let prefix = matches[0] ?? value
    for (const match of matches) {
      while (!match.startsWith(prefix)) prefix = prefix.slice(0, -1)
    }
    if (prefix.length > value.length) {
      setValue(prefix)
      return
    }
    append({ text: `${prompt} ${value}`, tone: 'cmd' })
    append(matches.map((match) => match.slice(match.lastIndexOf(' ') + 1)).join('  '), 'info')
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
