'use client'

import { IconChevronDown, IconChevronUp, IconGripVertical } from '@tabler/icons-react'
import { useState, useTransition, type DragEvent, type ReactNode } from 'react'
import styles from '../sudo.module.css'

export type SortableItem = {
  id: string
  label: string
  content: ReactNode
}

type Props = {
  items: SortableItem[]
  action: (formData: FormData) => void | Promise<void>
  csrf: string
  fields?: Record<string, string>
  layout?: 'list' | 'grid'
}

function move(order: string[], from: number, to: number): string[] {
  const next = [...order]
  const [moved] = next.splice(from, 1)
  if (moved === undefined) return order
  next.splice(to, 0, moved)
  return next
}

export function SortableList({ items, action, csrf, fields = {}, layout = 'list' }: Props) {
  const [order, setOrder] = useState(() => items.map((item) => item.id))
  const [dragId, setDragId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const byId = new Map(items.map((item) => [item.id, item]))

  const persist = (next: string[]) => {
    if (next.every((id, index) => id === items[index]?.id)) return
    const formData = new FormData()
    formData.set('csrf', csrf)
    for (const [key, value] of Object.entries(fields)) formData.set(key, value)
    for (const id of next) formData.append('order', id)
    startTransition(() => action(formData))
  }

  const shift = (index: number, step: number) => {
    const target = index + step
    if (target < 0 || target >= order.length) return
    const next = move(order, index, target)
    setOrder(next)
    persist(next)
  }

  const onDragOver = (event: DragEvent<HTMLLIElement>, overId: string) => {
    if (!dragId || dragId === overId) return
    event.preventDefault()
    const from = order.indexOf(dragId)
    const to = order.indexOf(overId)
    if (from < 0 || to < 0) return
    setOrder(move(order, from, to))
  }

  const onDragEnd = () => {
    setDragId(null)
    persist(order)
  }

  return (
    <ul
      className={`${styles.sortable} ${layout === 'grid' ? styles.sortableGrid : ''}`}
      aria-busy={pending}
    >
      {order.map((id, index) => {
        const item = byId.get(id)
        if (!item) return null
        return (
          <li
            key={id}
            className={`${styles.sortableItem} ${dragId === id ? styles.sortableDragging : ''}`}
            draggable={!pending}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', id)
              setDragId(id)
            }}
            onDragOver={(event) => onDragOver(event, id)}
            onDrop={(event) => event.preventDefault()}
            onDragEnd={onDragEnd}
          >
            <div className={styles.sortableControls}>
              <span className={styles.sortableGrip} aria-hidden="true">
                <IconGripVertical size={16} stroke={1.75} />
              </span>
              <button
                type="button"
                onClick={() => shift(index, -1)}
                disabled={pending || index === 0}
                aria-label={`Move ${item.label} up`}
              >
                <IconChevronUp size={16} stroke={1.75} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => shift(index, 1)}
                disabled={pending || index === order.length - 1}
                aria-label={`Move ${item.label} down`}
              >
                <IconChevronDown size={16} stroke={1.75} aria-hidden="true" />
              </button>
            </div>
            <div className={styles.sortableContent}>{item.content}</div>
          </li>
        )
      })}
    </ul>
  )
}
