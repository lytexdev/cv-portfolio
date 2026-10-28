'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './PageBoot.module.css'

const LINES = [
  { kind: 'start', text: 'Starting cv.target...' },
  { kind: 'ok', text: '[  OK  ] Started network-online.target' },
  { kind: 'ok', text: '[  OK  ] Mounted /home/immanuel/projects' },
  { kind: 'ok', text: '[  OK  ] Started nginx.service' },
  { kind: 'ok', text: '[  OK  ] Reached target hire.target' },
] as const

const COMMAND = 'xdg-open https://cv.lytex.dev'
const BAR_WIDTH = 16
const SESSION_KEY = 'cv-boot-done'

const LINE_DELAY = 150
const LINE_STEP = 150
const TYPE_STEP = 26
const BAR_STEP = 32
const FADE_DURATION = 460
const REVEAL_DURATION = 1100

type Phase = 'boot' | 'leaving' | 'done'

function subscribe() {
  return () => {}
}

function readShouldBoot(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== '1'
  } catch {
    return true
  }
}

function markDone() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {}
  document.documentElement.setAttribute('data-boot', 'done')
}

function progressBar(filled: number): string {
  const percent = Math.round((filled / BAR_WIDTH) * 100)
  return `[${'#'.repeat(filled)}${'-'.repeat(BAR_WIDTH - filled)}] ${String(percent).padStart(3)}%`
}

export function PageBoot() {
  const reduced = useReducedMotion()
  const shouldBoot = useSyncExternalStore(subscribe, readShouldBoot, () => true)
  const [lines, setLines] = useState(0)
  const [typed, setTyped] = useState(0)
  const [filled, setFilled] = useState(-1)
  const [phase, setPhase] = useState<Phase>('boot')
  const [skipped, setSkipped] = useState(false)

  useEffect(() => {
    if (!shouldBoot) return
    const timers: number[] = []
    const at = (delay: number, run: () => void) => {
      timers.push(window.setTimeout(run, delay))
    }

    const close = (start: number) => {
      at(start, () => {
        if (!reduced) document.documentElement.setAttribute('data-boot', 'reveal')
        setPhase('leaving')
      })
      at(start + FADE_DURATION, () => setPhase('done'))
      at(start + (reduced ? FADE_DURATION : REVEAL_DURATION), markDone)
    }

    if (skipped || reduced) {
      at(0, () => {
        setLines(LINES.length)
        setTyped(COMMAND.length)
        setFilled(BAR_WIDTH)
      })
      close(reduced ? 500 : 0)
    } else {
      LINES.forEach((_, index) => at(LINE_DELAY + index * LINE_STEP, () => setLines(index + 1)))
      const typeStart = LINE_DELAY + LINES.length * LINE_STEP + 120
      for (let i = 1; i <= COMMAND.length; i++) {
        at(typeStart + i * TYPE_STEP, () => setTyped(i))
      }
      const barStart = typeStart + COMMAND.length * TYPE_STEP + 220
      for (let i = 0; i <= BAR_WIDTH; i++) {
        at(barStart + i * BAR_STEP, () => setFilled(i))
      }
      close(barStart + BAR_WIDTH * BAR_STEP + 260)
    }

    return () => {
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [reduced, shouldBoot, skipped])

  useEffect(() => {
    if (!shouldBoot || skipped || phase !== 'boot') return
    const skip = () => setSkipped(true)
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [phase, shouldBoot, skipped])

  if (!shouldBoot || phase === 'done') return null

  return (
    <div
      className={`${styles.overlay} ${phase === 'leaving' ? styles.leaving : ''}`}
      aria-hidden="true"
      data-page-boot
    >
      <div className={styles.panel}>
        <div className={styles.chrome}>
          <span />
          <span />
          <span />
          <p className={styles.title}>boot - cv.lytex.dev</p>
        </div>
        <div className={styles.log}>
          {LINES.slice(0, lines).map((line) => (
            <p key={line.text} className={`${styles.line} ${styles[line.kind]}`}>
              {line.text}
            </p>
          ))}
          <p className={styles.prompt}>
            immanuel@lytex ~&gt; <span className={styles.cmd}>{COMMAND.slice(0, typed)}</span>
            {filled < 0 ? <span className={styles.cursor} /> : null}
          </p>
          {filled >= 0 ? (
            <p className={`${styles.line} ${styles.out}`}>Loading {progressBar(filled)}</p>
          ) : null}
          {filled === BAR_WIDTH ? (
            <p className={`${styles.line} ${styles.ok}`}>Opening...</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
