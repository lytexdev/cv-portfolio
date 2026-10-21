import type { CvDictionary } from './types'

export const en = {
  meta: {
    title: 'Immanuel Mruk · Full-Stack Developer',
    description:
      'CV and portfolio of Immanuel Mruk, full-stack developer with a security mindset from Wittlich.',
  },
  skipLink: 'Skip to content',
  role: 'Full-Stack Developer with a security mindset',
  summary:
    'I build web applications from the data model to the pixel and run the infrastructure behind them myself. Trained IT Specialist for Application Development (German vocational degree) with a focus on Vue/Nuxt and Symfony/Shopware, plus Python and React/Next.js, which this site is built with. Linux is home. Security and privacy are part of the design from day one.',
  availability: '',
  sections: {
    whoami: { rail: '01 / whoami', title: 'About' },
    experience: { rail: '02 / experience', title: 'Experience' },
    stack: { rail: '03 / stack', title: 'Tech stack' },
    projects: { rail: '04 / projects', title: 'Projects' },
    more: { rail: '05 / more', title: 'Languages, interests & strengths' },
    contact: { rail: '06 / contact', title: 'Contact' },
  },
  hero: {
    prompt: 'immanuel@lytex ~> whoami',
    ctaContact: 'Get in touch',
    ctaPrint: 'Save as PDF',
    metricSince: 'Building software since 2022',
    metricProjects: '{n} projects',
    tokenBadge: 'Personal version for {label}',
    tokenRole: 'Application for {role}',
    metaLocation: 'Location',
    metaAge: 'Age',
    metaLanguages: 'Languages',
    metaAvailability: 'Availability',
    ageYears: '{n}',
  },
  experience: {
    since: 'since {date}',
    entries: {
      freelance: {
        role: 'Freelance Full-Stack Developer',
        company: 'LYTEX',
        location: 'Wittlich',
        highlights: [
          'Client project KB-Reifendienst, Wittlich: concept and delivery of the website plus on-site IT setup',
          'Operating own server infrastructure with Docker Compose, reverse proxy, and encrypted backups',
        ],
      },
      qiky: {
        role: 'Full-Stack Web Developer',
        company: 'QIKY GmbH',
        location: 'Remote',
        highlights: [],
      },
      apprenticeship: {
        role: 'Apprenticeship as IT Specialist for Application Development',
        company: '8mylez GmbH',
        location: 'Paderborn',
        highlights: [
          'Vocational school project: Lockbox, encrypted password manager',
        ],
      },
    },
  },
  stack: {
    groups: {
      languages: 'Languages',
      frontend: 'Frontend',
      backend: 'Backend & data',
      infra: 'Infrastructure & DevOps',
      security: 'Security & privacy',
      tools: 'Tools & AI',
    },
    moreLabel: 'Additional skills',
  },
  projects: {
    featured: {
      'kb-reifendienst': {
        kicker: 'Client project · Website & IT infrastructure',
        title: 'KB-Reifendienst, Wittlich',
        summary:
          'Multilingual website with an admin area for an auto workshop, plus on-site IT infrastructure setup',
        highlights: [
          'Website in 6 languages (DE, EN, TR, RU, FR, ES)',
          'Admin dashboard with login and optional TOTP 2FA',
          'Spam protection via hCaptcha and honeypots',
          'External maps only after consent',
        ],
        linkLabel: 'View project',
        images: {
          '01.webp': {
            alt: 'Screenshot: KB-Reifendienst, website homepage',
            caption: 'Screenshot: KB-Reifendienst, website homepage',
          },
        },
      },
      homelab: {
        kicker: 'Self-hosting · Infrastructure',
        title: 'Homelab: own server infrastructure',
        summary:
          'A personal server that replaces everyday cloud services. Files, documents, and media run self-hosted instead of with big tech',
        highlights: [
          'Nextcloud, Paperless-ngx, and Jellyfin as Docker Compose stacks',
          'Reverse proxy with Let\'s Encrypt certificates',
          'Reachable despite DS-Lite/CGNAT via a custom reverse tunnel (frp)',
          'Encrypted, append-only backups with restic on a separate backup server',
        ],
        linkLabel: 'View project',
        images: {
          'nextcloud.webp': {
            alt: 'Screenshot: Homelab, Nextcloud file view',
            caption: 'Screenshot: Homelab, Nextcloud file view',
          },
          'paperless.webp': {
            alt: 'Screenshot: Homelab, Paperless-ngx document overview',
            caption: 'Screenshot: Homelab, Paperless-ngx document overview',
          },
          'jellyfin.webp': {
            alt: 'Screenshot: Homelab, Jellyfin media library',
            caption: 'Screenshot: Homelab, Jellyfin media library',
          },
        },
      },
      'camera-system': {
        kicker: 'Embedded · IoT · Security',
        title: 'Smart camera system on a Raspberry Pi',
        summary:
          'Self-hosted security system with local person detection and Telegram notifications, without a cloud subscription or vendor app',
        highlights: [
          'Frigate NVR for motion and person detection directly on the Pi',
          'Custom Python service (asyncio) bridging MQTT and Telegram',
          'Notifications via a Telegram bot',
          'Fully Docker Compose based, state in SQLite',
        ],
        linkLabel: 'View project',
        images: {
          'dashboard.webp': {
            alt: 'Screenshot: Smart camera system, dashboard',
            caption: 'Screenshot: Smart camera system, dashboard',
          },
          'detection.webp': {
            alt: 'Screenshot: Smart camera system, person detection',
            caption: 'Screenshot: Smart camera system, person detection',
          },
        },
      },
      'rust-backup': {
        kicker: 'CLI · Rust',
        title: 'Encrypted remote backups',
        summary:
          'Command-line tool in Rust that compresses, encrypts, and transfers data over SSH to a remote server',
        highlights: [],
        linkLabel: 'View project',
        images: {
          '01.webp': {
            alt: 'Screenshot: Encrypted remote backups, CLI output',
            caption: 'Screenshot: Encrypted remote backups, CLI output',
          },
        },
      },
      'lytex-media': {
        kicker: '',
        title: '',
        summary: '',
        highlights: [],
        linkLabel: '',
        images: {},
      },
      lockbox: {
        kicker: '',
        title: '',
        summary: '',
        highlights: [],
        linkLabel: '',
        images: {},
      },
      'secure-shredder': {
        kicker: '',
        title: '',
        summary: '',
        highlights: [],
        linkLabel: '',
        images: {},
      },
      'metadata-cli': {
        kicker: '',
        title: '',
        summary: '',
        highlights: [],
        linkLabel: '',
        images: {},
      },
      'security-blog': {
        kicker: '',
        title: '',
        summary: '',
        highlights: [],
        linkLabel: '',
        images: {},
      },
      'muffin-bot': {
        kicker: '',
        title: '',
        summary: '',
        highlights: [],
        linkLabel: '',
        images: {},
      },
      'med-tracker': {
        kicker: '',
        title: '',
        summary: '',
        highlights: [],
        linkLabel: '',
        images: {},
      },
      'resilient-shop': {
        kicker: '',
        title: '',
        summary: '',
        highlights: [],
        linkLabel: '',
        images: {},
      },
    },
    compact: {
      'kb-reifendienst': {
        kicker: '',
        title: '',
        oneLiner: '',
        highlights: [],
        images: {},
      },
      homelab: {
        kicker: '',
        title: '',
        oneLiner: '',
        highlights: [],
        images: {},
      },
      'camera-system': {
        kicker: '',
        title: '',
        oneLiner: '',
        highlights: [],
        images: {},
      },
      'rust-backup': {
        kicker: '',
        title: '',
        oneLiner: '',
        highlights: [],
        images: {},
      },
      'lytex-media': {
        kicker: 'Web development · Own brand',
        title: 'LYTEX MEDIA',
        oneLiner: 'My brand for web development',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: LYTEX MEDIA',
            caption: 'Screenshot: LYTEX MEDIA',
          },
        },
      },
      lockbox: {
        kicker: 'Vocational school project · Security',
        title: 'Lockbox',
        oneLiner:
          'Password manager with an encrypted vault, built as a vocational school project',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: Lockbox',
            caption: 'Screenshot: Lockbox',
          },
        },
      },
      'secure-shredder': {
        kicker: 'CLI · Security',
        title: 'Secure File Shredder',
        oneLiner:
          'Deletes files so they cannot be recovered even with forensic tools',
        highlights: [
          'Limitations stated openly: SSD wear leveling, TRIM, and copy-on-write or journaling filesystems',
        ],
        images: {
          '01.webp': {
            alt: 'Screenshot: Secure File Shredder',
            caption: 'Screenshot: Secure File Shredder',
          },
        },
      },
      'metadata-cli': {
        kicker: 'CLI · Privacy',
        title: 'Metadata tool',
        oneLiner: 'Reads, edits, and removes metadata from files',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: Metadata tool',
            caption: 'Screenshot: Metadata tool',
          },
        },
      },
      'security-blog': {
        kicker: 'Content · Archive',
        title: 'Blog on cybersecurity & privacy',
        oneLiner: 'My earlier blog with articles on IT security and privacy',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: Blog on cybersecurity & privacy',
            caption: 'Screenshot: Blog on cybersecurity & privacy',
          },
        },
      },
      'muffin-bot': {
        kicker: 'Discord bot · Automation',
        title: 'Muffin Bot',
        oneLiner:
          'Automates research over publicly available sources (OSINT) directly in Discord',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: Muffin Bot',
            caption: 'Screenshot: Muffin Bot',
          },
        },
      },
      'med-tracker': {
        kicker: 'App · Health',
        title: 'Medication & supplement tracker',
        oneLiner: 'App for recording and managing medications, supplements, and intake',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: Medication & supplement tracker',
            caption: 'Screenshot: Medication & supplement tracker',
          },
        },
      },
      'resilient-shop': {
        kicker: 'Learning project · Architecture',
        title: 'Resilient e-commerce system',
        oneLiner:
          'Shop system with multi-node deployment, mirroring, and crypto payments following privacy by design',
        highlights: [
          'Pure learning and experimentation project, never operated commercially',
        ],
        images: {
          '01.webp': {
            alt: 'Screenshot: Resilient e-commerce system',
            caption: 'Screenshot: Resilient e-commerce system',
          },
        },
      },
    },
    details: 'Details',
    viewProject: 'View project',
  },
  more: {
    languagesTitle: 'Languages',
    languages: [
      { name: 'German', level: 'native' },
      { name: 'English', level: 'good, written and spoken' },
    ],
    interestsTitle: 'Interests',
    interests: {
      webdev: 'Web development',
      security: 'Cybersecurity',
      linux: 'Linux & servers',
      biology: 'Biology & pharmacology',
      crypto: 'Crypto',
    },
    strengthsTitle: 'Strengths',
    strengths: {
      analytical: 'Analytical thinking',
      helpful: 'Helpful & patient',
      goalOriented: 'Goal-oriented',
    },
    moreSkillsTitle: 'Additional skills',
    dailyDriverTitle: 'Daily Driver',
    dailyDriverTagline: 'I use Arch btw',
  },
  contact: {
    headline: '',
    publicHint:
      'Phone number and address are included in the personal version of my application. Email is the fastest way to reach me.',
    expiredHint: "This personal link has expired. I'm still reachable by email.",
    saveVcard: 'Save vCard',
    savePdf: 'Save as PDF',
    copyEmail: 'Copy email',
    emailCopied: 'Email copied',
    phone: 'Phone',
    address: 'Address',
    birthDate: 'Date of birth',
  },
  palette: {
    placeholder: 'Search command or section…',
    groups: {
      navigation: 'Navigation',
      actions: 'Actions',
      links: 'Links',
    },
    actions: {
      theme: 'Toggle theme',
      lang: 'Switch language',
      copyEmail: 'Copy email',
      print: 'Save as PDF',
      vcard: 'Save vCard',
      terminal: 'Open terminal',
    },
  },
  theme: {
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
  },
  terminal: {
    open: 'Open terminal',
    prompt: 'immanuel@lytex ~>',
    readOnlyNote: '(true story: the container runs with read_only: true)',
  },
  notFound: {
    title: 'Not found',
    message: 'fish: Unknown command:',
    back: 'Back to the CV',
  },
  error: {
    title: 'Something went wrong',
    retry: 'Try again',
  },
  footer: {
    tagline: 'Self-hosted · Next.js',
    imprint: 'Imprint',
    privacy: 'Privacy',
    source: 'Source',
  },
  externalNewTab: '(opens in a new tab)',
  duration: {
    years: 'yrs',
    year: 'yr',
    months: 'mo',
    month: 'mo',
  },
} as const satisfies CvDictionary
