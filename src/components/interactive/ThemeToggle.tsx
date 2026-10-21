'use client'

import { IconMoon, IconSun } from '@tabler/icons-react'
import { useCallback, useSyncExternalStore } from 'react'
import styles from './ControlButton.module.css'

type Props = {
  toLightLabel: string
  toDarkLabel: string
}

function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}

function getTheme(): 'dark' | 'light' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export function setThemeValue(next: 'dark' | 'light'): void {
  document.documentElement.setAttribute('data-theme', next)
  try {
    localStorage.setItem('cv-theme', next)
  } catch {
  }
}

export function ThemeToggle({ toLightLabel, toDarkLabel }: Props) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'dark' as const)

  const toggle = useCallback(() => {
    setThemeValue(theme === 'dark' ? 'light' : 'dark')
  }, [theme])

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggle}
      aria-label={theme === 'dark' ? toLightLabel : toDarkLabel}
    >
      {theme === 'dark' ? (
        <IconSun size={20} stroke={1.75} aria-hidden="true" />
      ) : (
        <IconMoon size={20} stroke={1.75} aria-hidden="true" />
      )}
    </button>
  )
}
