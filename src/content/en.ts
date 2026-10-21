import type { CvDictionary } from './types'

export const en = {
  meta: {
    title: 'Immanuel Mruk · Full-Stack Developer',
    description:
      'CV and portfolio of Immanuel Mruk, full-stack developer with a security mindset from Wittlich.',
  },
  skipLink: 'Skip to content',
  sections: {
    whoami: { rail: '01 / whoami', title: 'About' },
    experience: { rail: '02 / experience', title: 'Experience' },
    stack: { rail: '03 / stack', title: 'Tech stack' },
    projects: { rail: '04 / projects', title: 'Projects' },
    more: { rail: '05 / more', title: 'Languages, interests & strengths' },
    contact: { rail: '06 / contact', title: 'Contact' },
  },
  notFound: {
    title: 'Not found',
    message: 'fish: Unknown command:',
    back: 'Zurück zum Lebenslauf · Back to the CV',
  },
  error: {
    title: 'Something went wrong',
    retry: 'Try again',
  },
  footer: {
    tagline: 'Self-hosted · Next.js · no cookies, no analytics, no third parties',
    imprint: 'Imprint',
    privacy: 'Privacy',
    source: 'Source',
  },
} as const satisfies CvDictionary
