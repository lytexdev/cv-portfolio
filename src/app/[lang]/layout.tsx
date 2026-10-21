import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { getDictionary, hasLocale } from '@/lib/i18n'

type Props = {
  children: ReactNode
  params: Promise<{ lang: string }>
}

const themeInitScript = `(function(){try{var t=localStorage.getItem('cv-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}document.documentElement.setAttribute('lang',document.documentElement.getAttribute('data-lang')||'de')}catch(e){}document.documentElement.classList.add('js');if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-reduced-motion','true')}else{document.documentElement.setAttribute('data-reduced-motion','false')}})();`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : 'de'
  const dictionary = getDictionary(locale)

  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        noarchive: true,
        nosnippet: true,
      },
    },
  }
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : 'de'
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <>
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('lang',${JSON.stringify(locale)});document.documentElement.setAttribute('data-lang',${JSON.stringify(locale)});${themeInitScript}`,
        }}
      />
      {children}
    </>
  )
}
