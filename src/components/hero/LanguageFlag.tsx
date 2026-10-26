import type { ReactNode } from 'react'
import type { SpokenLanguageCode } from '@/content/types'
import styles from './LanguageFlags.module.css'

type Props = {
  code: SpokenLanguageCode
  clipId: string
}

function horizontal(colors: string[]): ReactNode {
  const band = 16 / colors.length
  return colors.map((fill, i) => (
    <rect key={fill + i} width="16" height={band + 0.01} y={band * i} fill={fill} />
  ))
}

function vertical(colors: string[]): ReactNode {
  const band = 16 / colors.length
  return colors.map((fill, i) => (
    <rect key={fill + i} width={band + 0.01} height="16" x={band * i} fill={fill} />
  ))
}

const flags: Record<SpokenLanguageCode, () => ReactNode> = {
  de: () => horizontal(['#000000', '#dd0000', '#ffce00']),
  en: () => (
    <>
      <rect width="16" height="16" fill="#012169" />
      <path d="M0 0l16 16M16 0L0 16" stroke="#fff" strokeWidth="2.2" />
      <path d="M0 0l16 16M16 0L0 16" stroke="#C8102E" strokeWidth="1.1" />
      <path d="M8 0v16M0 8h16" stroke="#fff" strokeWidth="3.4" />
      <path d="M8 0v16M0 8h16" stroke="#C8102E" strokeWidth="2" />
    </>
  ),
  ru: () => horizontal(['#ffffff', '#0039a6', '#d52b1e']),
  es: () => (
    <>
      <rect width="16" height="16" fill="#aa151b" />
      <rect width="16" height="8" y="4" fill="#f1bf00" />
    </>
  ),
  fr: () => vertical(['#002654', '#ffffff', '#ce1126']),
  tr: () => (
    <>
      <rect width="16" height="16" fill="#e30a17" />
      <circle cx="6.3" cy="8" r="4" fill="#ffffff" />
      <circle cx="7.3" cy="8" r="3.2" fill="#e30a17" />
      <polygon
        points="8.65,8.00 9.83,7.59 9.86,6.34 10.62,7.33 11.82,6.97 11.10,8.00 11.82,9.03 10.62,8.67 9.86,9.66 9.83,8.41"
        fill="#ffffff"
      />
    </>
  ),
  it: () => vertical(['#009246', '#ffffff', '#ce2b37']),
  pl: () => horizontal(['#ffffff', '#dc143c']),
}

export function LanguageFlag({ code, clipId }: Props) {
  return (
    <svg className={styles.flag} viewBox="0 0 16 16" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <circle cx="8" cy="8" r="8" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{flags[code]()}</g>
    </svg>
  )
}
