'use client'

import type { ReactNode } from 'react'
import { useRef, useState, useTransition } from 'react'
import styles from '../sudo.module.css'

type Props = {
  action: (formData: FormData) => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  children: ReactNode
  className?: string
}

export function ConfirmForm({
  action,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  children,
  className,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const close = () => {
    dialogRef.current?.close()
    setOpen(false)
  }

  return (
    <>
      <form
        ref={formRef}
        className={className}
        action={action}
        onSubmit={(event) => {
          if (open) return
          event.preventDefault()
          setOpen(true)
          dialogRef.current?.showModal()
        }}
      >
        {children}
      </form>
      <dialog
        ref={dialogRef}
        className={styles.confirmDialog}
        onClose={() => setOpen(false)}
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
      >
        <div className={styles.confirmInner}>
          <h2 className={styles.confirmTitle}>{title}</h2>
          <p className={styles.confirmMessage}>{message}</p>
          <div className={styles.confirmActions}>
            <button
              type="button"
              className={styles.buttonGhost}
              onClick={close}
              disabled={pending}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonDanger}`}
              disabled={pending}
              onClick={() => {
                const form = formRef.current
                if (!form) return
                close()
                startTransition(() => {
                  const data = new FormData(form)
                  void action(data)
                })
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
