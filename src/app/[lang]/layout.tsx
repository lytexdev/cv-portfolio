import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  const locale = lang === 'en' ? 'en' : 'de'

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
