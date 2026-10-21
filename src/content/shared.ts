import type {
  ExperienceId,
  InterestId,
  ProjectSlug,
  StackGroupId,
  StrengthId,
  TechId,
} from './types'

export const person = {
  name: 'Immanuel Mruk',
  email: 'immanuel@lytex.dev',
  github: 'https://github.com/lytexdev',
  linkedin: 'https://www.linkedin.com/in/immanuel-mruk-775958372/',
  city: 'Wittlich',
  monogram: 'IM',
  softwareSinceYear: 2022,
} as const

export const sectionOrder = [
  'whoami',
  'experience',
  'stack',
  'projects',
  'more',
  'contact',
] as const

export const stackGroups: Record<StackGroupId, TechId[]> = {
  languages: [
    'typescript',
    'javascript',
    'python',
    'php',
    'rust',
    'html',
    'css',
    'scss',
  ],
  frontend: ['vue', 'nuxt', 'react', 'nextjs', 'tailwind', 'vite'],
  backend: [
    'symfony',
    'shopware',
    'fastapi',
    'flask',
    'graphql',
    'nodejs',
    'postgresql',
    'sqlite',
    'redis',
  ],
  infra: [
    'linux',
    'archlinux',
    'ubuntu',
    'debian',
    'docker',
    'nginx',
    'npm-proxy',
    'letsencrypt',
    'cloudflare',
    'aws',
    'git',
    'github',
  ],
  security: ['hardening', 'ssh', 'gnupg', 'luks', 'restic'],
  tools: ['cursor', 'claudecode', 'vscodium', 'fish', 'bash'],
}

export const moreSkills: TechId[] = ['raspberrypi', 'image-editing', 'office']

export const dailyDriver: TechId[] = [
  'archlinux',
  'ubuntu',
  'vscodium',
  'cursor',
  'claudecode',
]

export type ExperienceShared = {
  id: ExperienceId
  start: string
  end: string | null
  stack: TechId[]
  projectLinks?: ProjectSlug[]
  companyUrl?: string
}

export const experiences: ExperienceShared[] = [
  {
    id: 'freelance',
    start: '2026-04-01',
    end: null,
    stack: ['nuxt', 'vue', 'sqlite', 'docker', 'linux'],
    projectLinks: ['kb-reifendienst'],
  },
  {
    id: 'qiky',
    start: '2025-09-01',
    end: '2026-03-31',
    stack: ['vue', 'nuxt', 'typescript', 'graphql', 'aws'],
  },
  {
    id: 'apprenticeship',
    start: '2022-08-01',
    end: '2025-08-31',
    stack: ['shopware', 'symfony', 'php', 'vue', 'scss', 'python'],
    projectLinks: ['lockbox'],
  },
]

export type ProjectShared = {
  slug: ProjectSlug
  featured: boolean
  stack: TechId[]
  images: string[]
  href?: string
}

export const featuredProjectOrder: ProjectSlug[] = [
  'kb-reifendienst',
  'homelab',
  'camera-system',
  'rust-backup',
]

export const compactProjectOrder: ProjectSlug[] = [
  'lytex-media',
  'lockbox',
  'secure-shredder',
  'metadata-cli',
  'security-blog',
  'muffin-bot',
  'med-tracker',
  'resilient-shop',
]

export const projects: Record<ProjectSlug, ProjectShared> = {
  'kb-reifendienst': {
    slug: 'kb-reifendienst',
    featured: true,
    stack: ['nuxt', 'vue', 'sqlite', 'docker'],
    images: ['01.webp'],
    href: 'https://kb-reifendienst.de',
  },
  homelab: {
    slug: 'homelab',
    featured: true,
    stack: [
      'docker',
      'linux',
      'archlinux',
      'nextcloud',
      'paperless',
      'jellyfin',
      'npm-proxy',
      'restic',
    ],
    images: ['nextcloud.webp', 'paperless.webp', 'jellyfin.webp'],
  },
  'camera-system': {
    slug: 'camera-system',
    featured: true,
    stack: [
      'raspberrypi',
      'python',
      'frigate',
      'mqtt',
      'telegram',
      'sqlite',
      'docker',
      'nginx',
    ],
    images: ['dashboard.webp', 'detection.webp'],
  },
  'rust-backup': {
    slug: 'rust-backup',
    featured: true,
    stack: ['rust', 'ssh', 'linux'],
    images: ['01.webp'],
  },
  'lytex-media': {
    slug: 'lytex-media',
    featured: false,
    stack: [],
    images: ['01.webp'],
  },
  lockbox: {
    slug: 'lockbox',
    featured: false,
    stack: [],
    images: ['01.webp'],
  },
  'secure-shredder': {
    slug: 'secure-shredder',
    featured: false,
    stack: [],
    images: ['01.webp'],
  },
  'metadata-cli': {
    slug: 'metadata-cli',
    featured: false,
    stack: [],
    images: ['01.webp'],
  },
  'security-blog': {
    slug: 'security-blog',
    featured: false,
    stack: [],
    images: ['01.webp'],
  },
  'muffin-bot': {
    slug: 'muffin-bot',
    featured: false,
    stack: ['discord'],
    images: ['01.webp'],
  },
  'med-tracker': {
    slug: 'med-tracker',
    featured: false,
    stack: [],
    images: ['01.webp'],
  },
  'resilient-shop': {
    slug: 'resilient-shop',
    featured: false,
    stack: [],
    images: ['01.webp'],
  },
}

export const interestIcons: Record<InterestId, string> = {
  webdev: 'code',
  security: 'shield',
  linux: 'server',
  biology: 'dna',
  crypto: 'bitcoin',
}

export const strengthIcons: Record<StrengthId, string> = {
  analytical: 'chart',
  helpful: 'heart',
  goalOriented: 'target',
}

export const projectCount = featuredProjectOrder.length + compactProjectOrder.length
