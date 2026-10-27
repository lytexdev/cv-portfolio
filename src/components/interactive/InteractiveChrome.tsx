'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Lightbox, type ViewableImage } from '@/components/projects/Lightbox'
import { ProjectDialog, type ProjectDialogData } from '@/components/projects/ProjectDialog'
import type {
  CvDictionary,
  Locale,
  ProjectSlug,
  SpokenLanguage,
  StackGroupId,
  TechId,
} from '@/content/types'
import { ActiveSection } from './ActiveSection'
import { CommandPalette } from './CommandPalette'
import { MediaProtect } from './MediaProtect'
import { MiniTerminal } from './MiniTerminal'
import { RevealObserver } from './RevealObserver'
import { ToasterProvider, useToast } from './Toaster'

type ProjectPayload = {
  slug: ProjectSlug
  featured: boolean
  stack: TechId[]
  href?: string
  images: Array<{ filename: string; src: string | null; alt: string; caption: string }>
}

type Props = {
  locale: Locale
  dictionary: CvDictionary
  token?: string
  age: number | null
  phone?: string
  email: string
  github: string
  linkedin: string
  personName: string
  personCity: string
  projectPayloads: ProjectPayload[]
  stackGroups: Record<StackGroupId, TechId[]>
  spokenLanguages: SpokenLanguage[]
}

function InteractiveChromeInner({
  locale,
  dictionary,
  token,
  age,
  phone,
  email,
  github,
  linkedin,
  personName,
  personCity,
  projectPayloads,
  stackGroups,
  spokenLanguages,
}: Props) {
  const { showToast } = useToast()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [activeProject, setActiveProject] = useState<ProjectDialogData | null>(null)
  const [lightbox, setLightbox] = useState<{
    key: string
    images: ViewableImage[]
    startIndex: number
  } | null>(null)

  const payloadsBySlug = useMemo(() => {
    const map = new Map<ProjectSlug, ProjectPayload>()
    for (const payload of projectPayloads) {
      map.set(payload.slug, payload)
    }
    return map
  }, [projectPayloads])

  const projectSlugs = useMemo(
    () => projectPayloads.map((payload) => payload.slug),
    [projectPayloads],
  )

  const openProject = useCallback(
    (slug: ProjectSlug) => {
      const payload = payloadsBySlug.get(slug)
      if (!payload) return

      const featuredCopy = dictionary.projects.featured[slug]
      const compactCopy = dictionary.projects.compact[slug]
      const copy = payload.featured ? featuredCopy : compactCopy
      if (!copy) return

      setActiveProject({
        slug,
        kicker: copy.kicker,
        title: copy.title,
        summary: 'summary' in copy ? copy.summary : copy.oneLiner,
        highlights: copy.highlights,
        stack: payload.stack,
        href: payload.href,
        linkLabel: featuredCopy?.linkLabel || dictionary.projects.websiteLink,
        images: payload.images.map((image) => ({
          src: image.src,
          alt: image.alt,
          caption: image.caption,
          filename: image.filename,
        })),
      })
      setProjectOpen(true)
    },
    [dictionary, payloadsBySlug],
  )

  const openImage = useCallback(
    (slug: ProjectSlug, filename: string) => {
      const images = (payloadsBySlug.get(slug)?.images ?? []).filter(
        (image): image is ViewableImage => image.src !== null,
      )
      const startIndex = images.findIndex((image) => image.filename === filename)
      if (startIndex < 0) return
      setLightbox({ key: `${slug}/${filename}/${Date.now()}`, images, startIndex })
    },
    [payloadsBySlug],
  )

  const closeLightbox = useCallback(() => setLightbox(null), [])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email)
      showToast(dictionary.contact.emailCopied)
    } catch {
    }
  }, [dictionary.contact.emailCopied, email, showToast])

  const onPrint = useCallback(() => window.print(), [])

  const onVcard = useCallback(() => {
    if (!token) return
    const anchor = document.createElement('a')
    anchor.href = `/api/vcard?k=${encodeURIComponent(token)}`
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }, [token])

  useEffect(() => {
    let expanded: HTMLDetailsElement[] = []
    const onBeforePrint = () => {
      expanded = [...document.querySelectorAll<HTMLDetailsElement>('details[data-collapsible]')]
        .filter((details) => !details.open)
      for (const details of expanded) details.open = true
    }
    const onAfterPrint = () => {
      for (const details of expanded) details.open = false
      expanded = []
    }
    window.addEventListener('beforeprint', onBeforePrint)
    window.addEventListener('afterprint', onAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint)
      window.removeEventListener('afterprint', onAfterPrint)
    }
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      if (target.closest('[data-open-palette]')) {
        event.preventDefault()
        setPaletteOpen(true)
        return
      }

      if (target.closest('[data-open-terminal]')) {
        event.preventDefault()
        setTerminalOpen(true)
        return
      }

      const printTrigger = target.closest('[data-print-trigger]')
      if (printTrigger) {
        event.preventDefault()
        onPrint()
        return
      }

      const copyTrigger = target.closest('[data-copy-email]')
      if (copyTrigger) {
        event.preventDefault()
        void copyEmail()
        return
      }

      const imageTrigger = target.closest('[data-project-image]')
      if (imageTrigger) {
        const slug = imageTrigger.getAttribute('data-project-image') as ProjectSlug | null
        const filename = imageTrigger.getAttribute('data-image-file')
        if (slug && filename) {
          event.preventDefault()
          openImage(slug, filename)
        }
        return
      }

      const details = target.closest('[data-project-details]')
      if (details) {
        const slug = details.getAttribute('data-project-details') as ProjectSlug | null
        if (slug) openProject(slug)
      }
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [copyEmail, onPrint, openImage, openProject])

  return (
    <>
      <MediaProtect />
      <RevealObserver />
      <ActiveSection />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        locale={locale}
        dictionary={dictionary}
        hasToken={Boolean(token)}
        onOpenTerminal={() => setTerminalOpen(true)}
        onCopyEmail={() => void copyEmail()}
        onPrint={onPrint}
        onVcard={onVcard}
        githubUrl={github}
        linkedinUrl={linkedin}
      />

      <MiniTerminal
        open={terminalOpen}
        onOpenChange={setTerminalOpen}
        locale={locale}
        dictionary={dictionary}
        age={age}
        hasToken={Boolean(token)}
        phone={phone}
        email={email}
        github={github}
        linkedin={linkedin}
        personName={personName}
        personCity={personCity}
        projectSlugs={projectSlugs}
        stackGroups={stackGroups}
        spokenLanguages={spokenLanguages}
        onOpenProject={openProject}
      />

      <ProjectDialog
        open={projectOpen}
        onClose={() => setProjectOpen(false)}
        project={activeProject}
        labelledBy="project-dialog-title"
        externalNewTab={dictionary.externalNewTab}
        openImageLabel={dictionary.projects.gallery.open}
        onOpenImage={(filename) => {
          if (activeProject) openImage(activeProject.slug as ProjectSlug, filename)
        }}
      />

      {lightbox ? (
        <Lightbox
          key={lightbox.key}
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          labels={dictionary.projects.gallery}
          onClose={closeLightbox}
        />
      ) : null}
    </>
  )
}

export function InteractiveChrome(props: Props) {
  return (
    <ToasterProvider>
      <InteractiveChromeInner {...props} />
    </ToasterProvider>
  )
}
