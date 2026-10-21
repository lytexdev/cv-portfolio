'use client'

import { IconArrowUp } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Tooltip } from './Tooltip'
import styles from './ScrollToTop.module.css'

type Props = {
  label: string
}

export function ScrollToTop({ label }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 480)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <Tooltip label={label}>
      <button
        type="button"
        className={styles.button}
        aria-label={label}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <IconArrowUp size={20} stroke={1.75} aria-hidden="true" />
      </button>
    </Tooltip>
  )
}
