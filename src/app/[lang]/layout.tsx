import type { Metadata } from 'next'
import { connection } from 'next/server'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { hasLocale } from '@/lib/i18n'
import { getRuntimeDictionary } from '@/lib/server/content-db'
import { getEnv } from '@/lib/server/env'

type Props = {
  children: ReactNode
  params: Promise<{ lang: string }>
}

const themeInitScript = `(function(){try{var t=localStorage.getItem('cv-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}document.documentElement.setAttribute('lang',document.documentElement.getAttribute('data-lang')||'de')}catch(e){}document.documentElement.classList.add('js');try{if(sessionStorage.getItem('cv-boot-done')==='1'){document.documentElement.setAttribute('data-boot','done')}}catch(e){}if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-reduced-motion','true')}else{document.documentElement.setAttribute('data-reduced-motion','false')}})();`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection()
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : 'de'
  const dictionary = getRuntimeDictionary(locale)
  const indexPublic = getEnv().indexPublic

  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    robots: indexPublic
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        }
      : {
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
