import { connection } from 'next/server'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Experience } from '@/components/sections/Experience'
import { More } from '@/components/sections/More'
import { Projects } from '@/components/sections/Projects'
import { Stack } from '@/components/sections/Stack'
import { getDictionary, hasLocale } from '@/lib/i18n'
import { portraitSrc } from '@/lib/server/assets'
import { detectAgent, logEvent } from '@/lib/server/log'
import { getPrivateData, getPublicAge } from '@/lib/server/private-data'
import { resolveViewer } from '@/lib/server/viewer'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ k?: string | string[] }>
}

export default async function Page({ params, searchParams }: Props) {
  await connection()
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dictionary = getDictionary(lang)
  const query = await searchParams
  const rawK = Array.isArray(query.k) ? query.k[0] : query.k
  const { viewer, event } = resolveViewer(rawK ?? null)

  if (event) {
    const requestHeaders = await headers()
    logEvent({
      evt: event,
      tokenId:
        viewer.kind === 'token' || viewer.kind === 'expired' ? viewer.id : undefined,
      lang,
      agent: detectAgent(requestHeaders.get('user-agent')),
    })
  }

  const age = getPublicAge()
  const privateData = viewer.kind === 'token' ? getPrivateData() : null
  const tokenQuery = viewer.kind === 'token' ? viewer.token : undefined

  return (
    <main id="main" className="main-content">
      <About
        locale={lang}
        dictionary={dictionary}
        viewer={viewer}
        age={age}
        portraitSrc={portraitSrc()}
      />
      <Experience locale={lang} dictionary={dictionary} />
      <Stack dictionary={dictionary} />
      <Projects dictionary={dictionary} />
      <More dictionary={dictionary} />
      <Contact
        locale={lang}
        dictionary={dictionary}
        viewer={viewer}
        privateData={privateData}
        tokenQuery={tokenQuery}
      />
    </main>
  )
}
