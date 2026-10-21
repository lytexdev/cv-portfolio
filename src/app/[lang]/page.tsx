import { connection } from 'next/server'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { TokenGate } from '@/components/gate/TokenGate'
import { PageBoot } from '@/components/hero/PageBoot'
import { InteractiveChrome } from '@/components/interactive/InteractiveChrome'
import { TokenPersist } from '@/components/interactive/TokenPersist'
import { CvShell } from '@/components/layout/CvShell'
import { PrintHeader } from '@/components/print/PrintHeader'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Experience } from '@/components/sections/Experience'
import { More } from '@/components/sections/More'
import { Projects } from '@/components/sections/Projects'
import { Stack } from '@/components/sections/Stack'
import type { ProjectSlug } from '@/content/types'
import { hasLocale } from '@/lib/i18n'
import { portraitSrc, projectImageSrc, withAccessToken } from '@/lib/server/assets'
import {
  getRuntimeCompactOrder,
  getRuntimeDictionary,
  getRuntimeFeaturedOrder,
  getRuntimeProjects,
} from '@/lib/server/content-db'
import { getEnv } from '@/lib/server/env'
import { detectAgent, logEvent } from '@/lib/server/log'
import { getPrivateData, getPublicAge } from '@/lib/server/private-data'
import { getFooterConfig, getSiteProfile } from '@/lib/server/settings'
import { incrementTokenView } from '@/lib/server/tokens'
import { resolveViewer } from '@/lib/server/viewer'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ k?: string | string[] }>
}

function buildProjectPayloads(
  dictionary: ReturnType<typeof getRuntimeDictionary>,
  token?: string,
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
        src: projectImageSrc(slug, filename, token),
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
  const profile = getSiteProfile()

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
    return (
      <>
        <Suspense fallback={null}>
          <TokenPersist locale={lang} />
        </Suspense>
        <TokenGate locale={lang} reason={viewer.reason} />
      </>
    )
  }

  if (viewer.kind === 'expired') {
    return (
      <>
        <Suspense fallback={null}>
          <TokenPersist locale={lang} />
        </Suspense>
        <TokenGate locale={lang} reason="expired" label={viewer.label} />
      </>
    )
  }

  const isToken = viewer.kind === 'token'
  if (isToken) {
    incrementTokenView(viewer.id, { lang, agent })
  }

  const age = getPublicAge()
  const privateData = isToken ? getPrivateData() : null
  const tokenQuery = isToken ? viewer.token : undefined
  const env = getEnv()
  const footer = getFooterConfig()
  const pageUrl = tokenQuery
    ? `${env.publicBaseUrl}/${lang}?k=${encodeURIComponent(tokenQuery)}`
    : `${env.publicBaseUrl}/${lang}`
  const resolvedPortrait = profile.portraitPath
    ? withAccessToken(profile.portraitPath, tokenQuery)
    : portraitSrc(tokenQuery)

  return (
    <>
      <Suspense fallback={null}>
        <TokenPersist locale={lang} knownToken={tokenQuery} />
      </Suspense>
      <PageBoot />
      <InteractiveChrome
        locale={lang}
        dictionary={dictionary}
        token={tokenQuery}
        age={age}
        phone={privateData?.phone}
        email={profile.email}
        github={profile.github}
        linkedin={profile.linkedin}
        personName={profile.name}
        personCity={profile.city}
        projectPayloads={buildProjectPayloads(dictionary, tokenQuery)}
      />
      <CvShell
        locale={lang}
        dictionary={dictionary}
        personName={profile.name}
        footer={footer}
        version={env.version}
        buildSha={env.buildSha}
      >
        <main id="main" className="main-content">
          <PrintHeader
            dictionary={dictionary}
            viewer={viewer}
            privateData={privateData}
            pageUrl={pageUrl}
            personName={profile.name}
            email={profile.email}
            city={profile.city}
          />
          <About
            dictionary={dictionary}
            viewer={viewer}
            age={age}
            portraitSrc={resolvedPortrait}
            personName={profile.name}
            personCity={profile.city}
            personMonogram={profile.monogram}
            softwareSinceYear={profile.softwareSinceYear}
            github={profile.github}
            linkedin={profile.linkedin}
          />
          <Experience locale={lang} dictionary={dictionary} />
          <Stack dictionary={dictionary} />
          <Projects dictionary={dictionary} accessToken={tokenQuery} />
          <More dictionary={dictionary} />
          <Contact
            locale={lang}
            dictionary={dictionary}
            viewer={viewer}
            privateData={privateData}
            tokenQuery={tokenQuery}
            email={profile.email}
            city={profile.city}
            age={age}
          />
        </main>
      </CvShell>
    </>
  )
}
