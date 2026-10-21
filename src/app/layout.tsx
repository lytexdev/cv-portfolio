import type { ReactNode } from 'react'
import { jetbrainsMono, montserrat } from '@/lib/fonts'
import '@/styles/globals.css'

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html
      lang="de"
      data-theme="dark"
      className={`${montserrat.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}
