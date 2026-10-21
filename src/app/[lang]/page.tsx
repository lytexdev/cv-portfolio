import { connection } from 'next/server'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { TokenGate } from '@/components/gate/TokenGate'
import { InteractiveChrome } from '@/components/interactive/InteractiveChrome'
import { PrintHeader } from '@/components/print/PrintHeader'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Experience } from '@/components/sections/Experience'
import { More } from '@/components/sections/More'
import { Projects } from '@/components/sections/Projects'
import { Stack } from '@/components/sections/Stack'
import type { ProjectSlug } from '@/content/types'
import { hasLocale } from '@/lib/i18n'
import { portraitSrc, projectImageSrc } from '@/lib/server/assets'
import {
  getRuntimeCompactOrder,
  getRuntimeDictionary,
  getRuntimeFeaturedOrder,
  getRuntimeProjects,
} from '@/lib/server/content-db'
import { getEnv } from '@/lib/server/env'
import { detectAgent, logEvent } from '@/lib/server/log'
import { getPrivateData, getPublicAge } from '@/lib/server/private-data'
import { incrementTokenView } from '@/lib/server/tokens'
import { resolveViewer } from '@/lib/server/viewer'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ k?: string | string[] }>
}

function buildProjectPayloads(
  dictionary: ReturnType<typeof getRuntimeDictionary>,
) {
  const projects = getRuntimeProjects()
  const all = [...getRuntimeFeaturedOrder(), ...getRuntimeCompactOrder()]
  return all.map((slug: ProjectSlug) => {
    const project = projects[slug]
    const featured = project?.featured
    const copy = featured
      ? dictionary.projects.featured[slug]
      : dictionary.projects.compact[slug]

    return {
      slug,
      featured: Boolean(featured),
      images: (project?.images ?? []).map((filename) => ({
        filename,
        src: projectImageSrc(slug, filename),
        alt: copy?.images?.[filename]?.alt ?? copy?.title ?? slug,
        caption: copy?.images?.[filename]?.caption ?? copy?.title ?? slug,
      })),
    }
  })
}

export default async function Page({ params, searchParams }: Props) {
  await connection()
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dictionary = getRuntimeDictionary(lang)
  const query = await searchParams
  const rawK = Array.isArray(query.k) ? query.k[0] : query.k
  const { viewer, event } = resolveViewer(rawK ?? null)
  const requestHeaders = await headers()
  const agent = detectAgent(requestHeaders.get('user-agent'))

  if (event) {
    logEvent({
      evt: event,
      tokenId:
        viewer.kind === 'token' || viewer.kind === 'expired' ? viewer.id : undefined,
      lang,
      agent,
    })
  }

  if (viewer.kind === 'gate') {
    return <TokenGate locale={lang} reason={viewer.reason} />
  }

  if (viewer.kind === 'expired') {
    return <TokenGate locale={lang} reason="expired" label={viewer.label} />
  }

  incrementTokenView(viewer.id, { lang, agent })

  const age = getPublicAge()
  const privateData = getPrivateData()
  const tokenQuery = viewer.token
  const env = getEnv()
  const pageUrl = `${env.publicBaseUrl}/${lang}?k=${encodeURIComponent(tokenQuery)}`

  return (
    <>
      <InteractiveChrome
        locale={lang}
        dictionary={dictionary}
        token={tokenQuery}
        age={age}
        phone={privateData?.phone}
        projectPayloads={buildProjectPayloads(dictionary)}
      />
      <main id="main" className="main-content">
        <PrintHeader
          dictionary={dictionary}
          viewer={viewer}
          privateData={privateData}
          pageUrl={pageUrl}
        />
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
    </>
  )
}
