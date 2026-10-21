import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { SectionRail } from '@/components/layout/SectionRail'
import { TopBar } from '@/components/layout/TopBar'
import { getDictionary, hasLocale } from '@/lib/i18n'
import { getEnv } from '@/lib/server/env'

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
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  }
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : 'de'
  const dictionary = getDictionary(locale)
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const env = getEnv()

  return (
    <>
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('lang',${JSON.stringify(locale)});document.documentElement.setAttribute('data-lang',${JSON.stringify(locale)});${themeInitScript}`,
        }}
      />
      <a className="skip-link" href="#main">
        {dictionary.skipLink}
      </a>
      <TopBar locale={locale} dictionary={dictionary} />
      <div className="page-shell layout-with-rail">
        <SectionRail locale={locale} dictionary={dictionary} />
        <div className="main-column">
          {children}
          <Footer
            dictionary={dictionary}
            imprintUrl={env.legalImprintUrl}
            privacyUrl={env.legalPrivacyUrl}
            version={env.version}
            buildSha={env.buildSha}
          />
        </div>
      </div>
    </>
  )
}
