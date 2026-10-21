import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { jetbrainsMono, montserrat } from '@/lib/fonts'
import '@/styles/globals.css'

type Props = {
  children: ReactNode
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
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
