import type { ReactNode } from 'react'
import type { CvDictionary, Locale } from '@/content/types'
import { Footer } from '@/components/layout/Footer'
import { SectionRail } from '@/components/layout/SectionRail'
import { TopBar } from '@/components/layout/TopBar'
import { ScrollToTop } from '@/components/interactive/ScrollToTop'
import type { FooterConfig } from '@/lib/server/settings'

type Props = {
  locale: Locale
  dictionary: CvDictionary
  personName: string
  footer: FooterConfig
  version?: string
  buildSha?: string
  token?: string
  children: ReactNode
}

export function CvShell({
  locale,
  dictionary,
  personName,
  footer,
  version,
  buildSha,
  token,
  children,
}: Props) {
  return (
    <>
      <TopBar
        locale={locale}
        dictionary={dictionary}
        personName={personName}
        token={token}
      />
      <div className="layout-with-rail">
        <SectionRail locale={locale} dictionary={dictionary} token={token} />
        <div className="main-column page-shell">
          {children}
          <Footer
            dictionary={dictionary}
            locale={locale}
            footer={footer}
            version={version}
            buildSha={buildSha}
          />
        </div>
      </div>
      <ScrollToTop label={locale === 'de' ? 'Nach oben' : 'Back to top'} />
    </>
  )
}
