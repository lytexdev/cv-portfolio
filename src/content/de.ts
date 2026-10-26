import type { CvDictionary } from './types'

export const de = {
  meta: {
    title: 'Immanuel Mruk · Fullstack-Entwickler',
    description:
      'Lebenslauf und Portfolio von Immanuel Mruk, Fullstack-Entwickler mit Security-Fokus aus Wittlich.',
  },
  skipLink: 'Zum Inhalt springen',
  role: 'Fullstack-Entwickler mit Security-Fokus',
  summary:
    'Ich baue Webanwendungen vom Datenmodell bis zum Pixel und betreibe die Infrastruktur dahinter selbst. Ausgebildeter Fachinformatiker für Anwendungsentwicklung mit Schwerpunkt Vue/Nuxt und Symfony/Shopware, dazu Python sowie React/Next.js, womit auch diese Seite gebaut ist. Linux ist mein Zuhause, Security und Privacy denke ich von Anfang an mit.',
  availability: '',
  sections: {
    whoami: { rail: '01 / whoami', title: 'Über mich' },
    experience: { rail: '02 / experience', title: 'Werdegang' },
    stack: { rail: '03 / stack', title: 'Tech-Stack' },
    projects: { rail: '04 / projects', title: 'Projekte' },
    more: { rail: '05 / more', title: 'Sprachen, Interessen & Stärken' },
    contact: { rail: '06 / contact', title: 'Kontakt' },
  },
  hero: {
    prompt: 'immanuel@lytex ~> whoami',
    ctaContact: 'Kontakt aufnehmen',
    ctaPrint: 'Als PDF speichern',
    tokenBadge: 'Persönliche Version für {label}',
    tokenRole: 'Bewerbung als {role}',
    tokenDismiss: 'Hinweis ausblenden',
    metaLocation: 'Ort',
    metaAge: 'Alter',
    metaLanguages: 'Sprachen',
    metaAvailability: 'Verfügbarkeit',
    ageYears: '{n}',
  },
  experience: {
    since: 'seit {date}',
    entries: {
      freelance: {
        role: 'Freelance Fullstack-Entwickler',
        company: 'LYTEX',
        location: 'Wittlich',
        highlights: [
          'Kundenprojekt KB-Reifendienst, Wittlich: Konzeption und Umsetzung der Website sowie Einrichtung der IT-Infrastruktur',
          'Betrieb der eigenen Server-Infrastruktur mit Docker Compose, Reverse Proxy und verschlüsselten Backups',
        ],
      },
      qiky: {
        role: 'Fullstack-Webentwickler',
        company: 'QIKY GmbH',
        location: 'Remote',
        highlights: [],
      },
      apprenticeship: {
        role: 'Ausbildung zum Fachinformatiker für Anwendungsentwicklung',
        company: '8mylez GmbH',
        location: 'Paderborn',
        highlights: [
          'Berufsschulprojekt: Lockbox, verschlüsselter Passwortmanager',
        ],
      },
    },
  },
  stack: {
    groups: {
      languages: 'Sprachen',
      frontend: 'Frontend',
      backend: 'Backend & Daten',
      infra: 'Infrastruktur & DevOps',
      security: 'Security & Privacy',
      tools: 'Tools & AI',
    },
    moreLabel: 'Weitere Kenntnisse',
  },
  projects: {
    featured: {
      'kb-reifendienst': {
        kicker: 'Kundenprojekt · Website & IT-Infrastruktur',
        title: 'KB-Reifendienst, Wittlich',
        summary:
          'Mehrsprachige Website mit Admin-Bereich für eine Autowerkstatt, dazu die Einrichtung der IT-Infrastruktur vor Ort',
        highlights: [
          'Website in 6 Sprachen (DE, EN, TR, RU, FR, ES)',
          'Admin-Dashboard mit Login und optionaler TOTP-2FA',
          'Spam-Schutz über hCaptcha und Honeypots',
          'Externe Karten erst nach Einwilligung',
        ],
        linkLabel: 'Projekt ansehen',
        images: {
          '01.webp': {
            alt: 'Screenshot: KB-Reifendienst, Website-Startseite',
            caption: 'Screenshot: KB-Reifendienst, Website-Startseite',
          },
        },
      },
      homelab: {
        kicker: 'Self-Hosting · Infrastruktur',
        title: 'Homelab: eigene Server-Infrastruktur',
        summary:
          'Eigener Server, der Cloud-Dienste im Alltag ersetzt. Dateien, Dokumente und Medien laufen selbst gehostet statt bei Big Tech',
        highlights: [
          'Nextcloud, Paperless-ngx und Jellyfin als Docker-Compose-Stacks',
          'Reverse Proxy mit Let\'s-Encrypt-Zertifikaten',
          'Erreichbar trotz DS-Lite/CGNAT über einen eigenen Reverse-Tunnel (frp)',
          'Verschlüsselte, append-only Backups mit restic auf separatem Backup-Server',
        ],
        linkLabel: 'Projekt ansehen',
        images: {
          'nextcloud.webp': {
            alt: 'Screenshot: Homelab, Nextcloud-Dateiansicht',
            caption: 'Screenshot: Homelab, Nextcloud-Dateiansicht',
          },
          'paperless.webp': {
            alt: 'Screenshot: Homelab, Paperless-ngx Dokumentenübersicht',
            caption: 'Screenshot: Homelab, Paperless-ngx Dokumentenübersicht',
          },
          'jellyfin.webp': {
            alt: 'Screenshot: Homelab, Jellyfin Medienbibliothek',
            caption: 'Screenshot: Homelab, Jellyfin Medienbibliothek',
          },
        },
      },
      'camera-system': {
        kicker: 'Embedded · IoT · Security',
        title: 'Smart-Kamera-System auf dem Raspberry Pi',
        summary:
          'Selbst gehostetes Sicherheitssystem mit lokaler Personenerkennung und Benachrichtigung über Telegram, ohne Cloud-Abo und ohne Hersteller-App',
        highlights: [
          'Frigate NVR für Bewegungs- und Personenerkennung direkt auf dem Pi',
          'Eigener Python-Service (asyncio) als Brücke zwischen MQTT und Telegram',
          'Benachrichtigungen über einen Telegram-Bot',
          'Komplett per Docker Compose, Zustände in SQLite',
        ],
        linkLabel: 'Projekt ansehen',
        images: {
          'dashboard.webp': {
            alt: 'Screenshot: Smart-Kamera-System, Dashboard',
            caption: 'Screenshot: Smart-Kamera-System, Dashboard',
          },
          'detection.webp': {
            alt: 'Screenshot: Smart-Kamera-System, Personenerkennung',
            caption: 'Screenshot: Smart-Kamera-System, Personenerkennung',
          },
        },
      },
      'rust-backup': {
        kicker: 'CLI · Rust',
        title: 'Verschlüsselte Remote-Backups',
        summary:
          'Kommandozeilen-Tool in Rust, das Daten komprimiert, verschlüsselt und per SSH auf einen Remote-Server überträgt',
        highlights: [],
        linkLabel: 'Projekt ansehen',
        images: {
          '01.webp': {
            alt: 'Screenshot: Verschlüsselte Remote-Backups, CLI-Ausgabe',
            caption: 'Screenshot: Verschlüsselte Remote-Backups, CLI-Ausgabe',
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
        kicker: 'Webentwicklung · Eigene Marke',
        title: 'LYTEX MEDIA',
        oneLiner: 'Meine Marke für Webentwicklung',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: LYTEX MEDIA',
            caption: 'Screenshot: LYTEX MEDIA',
          },
        },
      },
      lockbox: {
        kicker: 'Berufsschulprojekt · Security',
        title: 'Lockbox',
        oneLiner:
          'Passwortmanager mit verschlüsseltem Tresor, entwickelt als Projekt für die Berufsschule',
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
          'Löscht Dateien so, dass sie auch mit forensischen Tools nicht wiederherstellbar sind',
        highlights: [
          'Grenzen offen benannt: SSD-Wear-Leveling, TRIM sowie Copy-on-Write- und Journaling-Dateisysteme',
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
        title: 'Metadaten-Werkzeug',
        oneLiner: 'Liest, bearbeitet und entfernt Metadaten aus Dateien',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: Metadaten-Werkzeug',
            caption: 'Screenshot: Metadaten-Werkzeug',
          },
        },
      },
      'security-blog': {
        kicker: 'Content · Archiv',
        title: 'Blog zu Cybersecurity & Privacy',
        oneLiner: 'Mein früherer Blog mit Artikeln rund um IT-Sicherheit und Datenschutz',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: Blog zu Cybersecurity & Privacy',
            caption: 'Screenshot: Blog zu Cybersecurity & Privacy',
          },
        },
      },
      'muffin-bot': {
        kicker: 'Discord-Bot · Automatisierung',
        title: 'Muffin Bot',
        oneLiner:
          'Automatisiert Recherchen über öffentlich zugängliche Quellen (OSINT) direkt in Discord',
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
        title: 'Medikamenten- & Supplement-Tracker',
        oneLiner:
          'App zum Erfassen und Verwalten von Medikamenten, Supplements und ihrer Einnahme',
        highlights: [],
        images: {
          '01.webp': {
            alt: 'Screenshot: Medikamenten- & Supplement-Tracker',
            caption: 'Screenshot: Medikamenten- & Supplement-Tracker',
          },
        },
      },
      'resilient-shop': {
        kicker: 'Lernprojekt · Architektur',
        title: 'Resilientes E-Commerce-System',
        oneLiner:
          'Shop-System mit Multi-Node-Deployment, Mirroring und Krypto-Zahlungen nach Privacy by Design',
        highlights: [
          'Reines Lern- und Experimentierprojekt, nie kommerziell betrieben',
        ],
        images: {
          '01.webp': {
            alt: 'Screenshot: Resilientes E-Commerce-System',
            caption: 'Screenshot: Resilientes E-Commerce-System',
          },
        },
      },
    },
    details: 'Details',
    viewProject: 'Projekt ansehen',
  },
  more: {
    languagesTitle: 'Sprachen',
    languages: [
      { name: 'Deutsch', level: 'Muttersprache', code: 'de' },
      { name: 'Englisch', level: 'gut in Wort und Schrift', code: 'en' },
    ],
    interestsTitle: 'Interessen',
    interests: {
      webdev: 'Webentwicklung',
      security: 'Cybersecurity',
      linux: 'Linux & Server',
      biology: 'Biologie & Pharmakologie',
      crypto: 'Krypto',
    },
    strengthsTitle: 'Stärken',
    strengths: {
      analytical: 'Analytische Denkweise',
      helpful: 'Hilfsbereit & geduldig',
      goalOriented: 'Zielorientiert',
    },
    moreSkillsTitle: 'Weitere Kenntnisse',
    dailyDriverTitle: 'Daily Driver',
    dailyDriverTagline: 'I use Arch btw',
  },
  contact: {
    headline: '',
    publicHint:
      'Telefonnummer und Anschrift stehen in der persönlichen Version meiner Bewerbung. Am schnellsten erreichbar bin ich per E-Mail.',
    expiredHint:
      'Dieser persönliche Link ist abgelaufen. Per E-Mail bin ich weiterhin erreichbar.',
    saveVcard: 'vCard speichern',
    savePdf: 'Als PDF speichern',
    copyEmail: 'E-Mail kopieren',
    emailCopied: 'E-Mail kopiert',
    phone: 'Telefon',
    address: 'Anschrift',
    birthDate: 'Geburtsdatum',
    ageTooltip: '{n} Jahre alt',
  },
  palette: {
    placeholder: 'Befehl oder Sektion suchen …',
    groups: {
      navigation: 'Navigation',
      actions: 'Aktionen',
      links: 'Links',
    },
    actions: {
      theme: 'Theme wechseln',
      lang: 'Sprache wechseln',
      copyEmail: 'E-Mail kopieren',
      print: 'Als PDF speichern',
      vcard: 'vCard speichern',
      terminal: 'Terminal öffnen',
    },
  },
  theme: {
    toLight: 'Zu hellem Design wechseln',
    toDark: 'Zu dunklem Design wechseln',
  },
  terminal: {
    open: 'Terminal öffnen',
    prompt: 'immanuel@lytex ~>',
    readOnlyNote: '(stimmt wirklich: der Container läuft mit read_only: true)',
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
    tagline: 'Self-hosted · Next.js',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    source: 'Quellcode',
  },
  externalNewTab: '(öffnet in neuem Tab)',
  duration: {
    years: 'J.',
    year: 'J.',
    months: 'Mon.',
    month: 'Mon.',
  },
} as const satisfies CvDictionary
