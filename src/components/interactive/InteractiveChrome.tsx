'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProjectDialog, type ProjectDialogData } from '@/components/projects/ProjectDialog'
import { person, projects } from '@/content/shared'
import type { CvDictionary, Locale, ProjectSlug } from '@/content/types'
import { ActiveSection } from './ActiveSection'
import { CommandPalette } from './CommandPalette'
import { MiniTerminal } from './MiniTerminal'
import { RevealObserver } from './RevealObserver'
import { ToasterProvider, useToast } from './Toaster'

type ProjectPayload = {
  slug: ProjectSlug
  featured: boolean
  images: Array<{ filename: string; src: string | null; alt: string; caption: string }>
}

type Props = {
  locale: Locale
  dictionary: CvDictionary
  token?: string
  age: number | null
  phone?: string
  projectPayloads: ProjectPayload[]
}

function InteractiveChromeInner({
  locale,
  dictionary,
  token,
  age,
  phone,
  projectPayloads,
}: Props) {
  const { showToast } = useToast()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [activeProject, setActiveProject] = useState<ProjectDialogData | null>(null)

  const payloadsBySlug = useMemo(() => {
    const map = new Map<ProjectSlug, ProjectPayload>()
    for (const payload of projectPayloads) {
      map.set(payload.slug, payload)
    }
    return map
  }, [projectPayloads])

  const openProject = useCallback(
    (slug: ProjectSlug) => {
      const payload = payloadsBySlug.get(slug)
      const shared = projects[slug]
      if (!payload || !shared) return

      const featuredCopy = dictionary.projects.featured[slug]
      const compactCopy = dictionary.projects.compact[slug]

      setActiveProject({
        slug,
        kicker: payload.featured ? featuredCopy.kicker : compactCopy.kicker,
        title: payload.featured ? featuredCopy.title : compactCopy.title,
        summary: payload.featured ? featuredCopy.summary : compactCopy.oneLiner,
        highlights: payload.featured
          ? featuredCopy.highlights
          : compactCopy.highlights,
        stack: shared.stack,
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

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(person.email)
      showToast(dictionary.contact.emailCopied)
    } catch {
    }
  }, [dictionary.contact.emailCopied, showToast])

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

      const details = target.closest('[data-project-details]')
      if (details) {
        const slug = details.getAttribute('data-project-details') as ProjectSlug | null
        if (slug) openProject(slug)
      }
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [copyEmail, onPrint, openProject])

  return (
    <>
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
        githubUrl={person.github}
        linkedinUrl={person.linkedin}
      />

      <MiniTerminal
        open={terminalOpen}
        onOpenChange={setTerminalOpen}
        locale={locale}
        dictionary={dictionary}
        age={age}
        hasToken={Boolean(token)}
        phone={phone}
        onOpenProject={openProject}
      />

      <ProjectDialog
        open={projectOpen}
        onClose={() => setProjectOpen(false)}
        project={activeProject}
        labelledBy="project-dialog-title"
      />
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
