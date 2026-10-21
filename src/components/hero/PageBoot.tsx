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
  { kind: 'cmd', text: 'immanuel@lytex ~> whoami' },
  { kind: 'out', text: 'Immanuel Mruk' },
] as const

const SESSION_KEY = 'cv-boot-done'

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

export function PageBoot() {
  const reduced = useReducedMotion()
  const shouldBoot = useSyncExternalStore(subscribe, readShouldBoot, () => false)
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!shouldBoot || done) return

    const timers: number[] = []
    const finish = () => {
      timers.push(
        window.setTimeout(() => {
          setLeaving(true)
          timers.push(
            window.setTimeout(() => {
              try {
                sessionStorage.setItem(SESSION_KEY, '1')
              } catch {
                // ignore
              }
              setDone(true)
            }, 420),
          )
        }, reduced ? 400 : 180 + LINES.length * 320 + 500),
      )
    }

    if (reduced) {
      timers.push(
        window.setTimeout(() => {
          setCount(LINES.length)
          finish()
        }, 0),
      )
    } else {
      LINES.forEach((_, index) => {
        timers.push(
          window.setTimeout(() => setCount(index + 1), 180 + index * 320),
        )
      })
      finish()
    }

    return () => {
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [done, reduced, shouldBoot])

  if (!shouldBoot || done) return null

  return (
    <div
      className={`${styles.overlay} ${leaving ? styles.leaving : ''}`}
      aria-hidden="true"
    >
      <div className={styles.panel}>
        <div className={styles.chrome}>
          <span />
          <span />
          <span />
          <p className={styles.title}>boot - cv.lytex.dev</p>
        </div>
        <div className={styles.log}>
          {LINES.slice(0, count).map((line) => (
            <p
              key={line.text}
              className={`${styles.line} ${styles[line.kind]}`}
            >
              {line.text}
            </p>
          ))}
          <p className={styles.prompt}>
            immanuel@lytex ~&gt;
            <span className={styles.cursor} />
          </p>
        </div>
      </div>
    </div>
  )
}
