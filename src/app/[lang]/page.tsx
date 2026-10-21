import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { sectionOrder } from '@/content/shared'
import type { SectionId } from '@/content/types'
import { getDictionary, hasLocale } from '@/lib/i18n'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ k?: string | string[] }>
}

export default async function Page({ params }: Props) {
  await connection()
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dictionary = getDictionary(lang)

  return (
    <main id="main" className="main-content">
      {sectionOrder.map((id: SectionId) => {
        const section = dictionary.sections[id]
        return (
          <section
            key={id}
            id={id}
            className="section"
            aria-labelledby={`${id}-title`}
            data-reveal={id === 'whoami' ? undefined : true}
          >
            <SectionHeading id={id} rail={section.rail} title={section.title} />
          </section>
        )
      })}
    </main>
  )
}
