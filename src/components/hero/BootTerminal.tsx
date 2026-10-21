'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './BootTerminal.module.css'

const LINES = [
  '[  OK  ] Started cv.service',
  '[  OK  ] Mounted /home/immanuel/projects',
  '[  OK  ] Reached target hire.target',
]

function BootLines({ visibleCount, showCursor }: { visibleCount: number; showCursor: boolean }) {
  return (
    <div className={styles.root} aria-hidden="true">
      {LINES.map((line, index) => (
        <p
          key={line}
          className={`${styles.line} ${index < visibleCount ? styles.visible : ''}`}
        >
          <span className={styles.ok}>{line.slice(0, 8)}</span>
          {line.slice(8)}
        </p>
      ))}
      <p className={styles.prompt}>
        immanuel@lytex ~&gt;
        <span className={`${styles.cursor} ${showCursor ? styles.cursorOn : ''}`} />
      </p>
    </div>
  )
}

function AnimatedBoot() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const timers: number[] = []
    LINES.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => setVisibleCount(index + 1), 200 + index * 280),
      )
    })
    return () => {
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setShowCursor((v) => !v), 530)
    return () => window.clearInterval(id)
  }, [])

  return <BootLines visibleCount={visibleCount} showCursor={showCursor} />
}

export function BootTerminal() {
  const reduced = useReducedMotion()

  if (reduced) {
    return <BootLines visibleCount={LINES.length} showCursor />
  }

  return <AnimatedBoot />
}
