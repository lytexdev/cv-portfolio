export type Locale = 'de' | 'en'

export type SectionId =
  | 'whoami'
  | 'experience'
  | 'stack'
  | 'projects'
  | 'more'
  | 'contact'

export type CvDictionary = {
  meta: {
    title: string
    description: string
  }
  skipLink: string
  sections: Record<
    SectionId,
    {
      rail: string
      title: string
    }
  >
  notFound: {
    title: string
    message: string
    back: string
  }
  error: {
    title: string
    retry: string
  }
  footer: {
    tagline: string
    imprint: string
    privacy: string
    source: string
  }
}

export type TechId = string
