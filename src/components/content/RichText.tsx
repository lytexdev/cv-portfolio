import type { ReactNode } from 'react'
import type { TechId } from '@/content/types'
import { TechIcon } from '@/components/icons/TechIcon'
import { techRegistry } from '@/components/icons/registry'
import styles from './RichText.module.css'

type Props = {
  text: string
  className?: string
  as?: 'span' | 'p' | 'div'
}

const TOKEN =
  /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|<icon-[a-z0-9-]+\s*\/?>)/gi

function isTechId(value: string): value is TechId {
  return Object.prototype.hasOwnProperty.call(techRegistry, value)
}

function isMarkup(token: string): boolean {
  return (
    (token.startsWith('**') && token.endsWith('**') && token.length > 4) ||
    (token.startsWith('*') && token.endsWith('*') && token.length > 2 && !token.startsWith('**')) ||
    (token.startsWith('`') && token.endsWith('`') && token.length > 2) ||
    /^<icon-[a-z0-9-]+\s*\/?>$/i.test(token)
  )
}

function renderToken(token: string, key: number): ReactNode {
  if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
    return (
      <strong key={key} className={styles.bold}>
        {token.slice(2, -2)}
      </strong>
    )
  }

  if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
    return (
      <em key={key} className={styles.italic}>
        {token.slice(1, -1)}
      </em>
    )
  }

  if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
    return (
      <code key={key} className={styles.code}>
        {token.slice(1, -1)}
      </code>
    )
  }

  const iconMatch = token.match(/^<icon-([a-z0-9-]+)\s*\/?>$/i)
  if (iconMatch?.[1] && isTechId(iconMatch[1])) {
    return (
      <span key={key} className={styles.icon}>
        <TechIcon id={iconMatch[1]} />
      </span>
    )
  }

  return <span key={key}>{token}</span>
}

export function RichText({ text, className, as = 'span' }: Props) {
  const parts = text.split(TOKEN).filter((part) => part.length > 0)
  const nodes = parts.map((part, index) =>
    isMarkup(part) ? renderToken(part, index) : <span key={index}>{part}</span>,
  )

  const Tag = as
  return (
    <Tag className={className ? `${styles.root} ${className}` : styles.root}>{nodes}</Tag>
  )
}
