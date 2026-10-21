'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import styles from './Toaster.module.css'

type ToastContextValue = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToasterProvider')
  }
  return ctx
}

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  const showToast = useCallback((next: string) => {
    setMessage(next)
    window.setTimeout(() => setMessage(null), 2000)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} aria-live="polite" aria-atomic="true">
        {message ? <p className={styles.toast}>{message}</p> : null}
      </div>
    </ToastContext.Provider>
  )
}
