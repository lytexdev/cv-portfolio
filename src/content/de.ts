import type { CvDictionary } from './types'

export const de = {
  meta: {
    title: 'Immanuel Mruk · Fullstack-Entwickler',
    description:
      'Lebenslauf und Portfolio von Immanuel Mruk, Fullstack-Entwickler mit Security-Fokus aus Wittlich.',
  },
  skipLink: 'Zum Inhalt springen',
  sections: {
    whoami: { rail: '01 / whoami', title: 'Über mich' },
    experience: { rail: '02 / experience', title: 'Werdegang' },
    stack: { rail: '03 / stack', title: 'Tech-Stack' },
    projects: { rail: '04 / projects', title: 'Projekte' },
    more: { rail: '05 / more', title: 'Sprachen, Interessen & Stärken' },
    contact: { rail: '06 / contact', title: 'Kontakt' },
  },
  notFound: {
    title: 'Nicht gefunden',
    message: 'fish: Unknown command:',
    back: 'Zurück zum Lebenslauf · Back to the CV',
  },
  error: {
    title: 'Etwas ist schiefgelaufen',
    retry: 'Erneut versuchen',
  },
  footer: {
    tagline: 'Self-hosted · Next.js · keine Cookies, keine Analytics, keine Drittanbieter',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    source: 'Quellcode',
  },
} as const satisfies CvDictionary
