import 'server-only'
import { getDb } from './db'
import { getEnv } from './env'
import {
  dailyDriver as seedDaily,
  moreSkills as seedMore,
  person as seedPerson,
  stackGroups as seedStack,
} from '@/content/shared'
import type { StackGroupId, TechId } from '@/content/types'

export type SiteProfile = {
  name: string
  email: string
  github: string
  linkedin: string
  city: string
  monogram: string
  softwareSinceYear: number
  portraitPath: string | null
  logoPath: string | null
  cvPdfPath: string | null
}

export type StackConfig = {
  groups: Record<StackGroupId, TechId[]>
  moreSkills: TechId[]
  dailyDriver: TechId[]
}

export type SocialPlatform =
  | 'github'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'spotify'
  | 'discord'

export type SocialLink = {
  platform: SocialPlatform
  url: string
  label: string
}

export type FooterConfig = {
  taglineDe: string
  taglineEn: string
  imprintUrl: string
  privacyUrl: string
  repoUrl: string
  showVersion: boolean
  socials: SocialLink[]
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  'github',
  'linkedin',
  'youtube',
  'tiktok',
  'instagram',
  'spotify',
  'discord',
]

function getSetting(key: string): string | null {
  const row = getDb()
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(key) as { value: string } | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string) {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
    .run(key, value)
}

export function getSiteProfile(): SiteProfile {
  const raw = getSetting('site_profile')
  if (raw) {
    try {
      return { ...defaultProfile(), ...(JSON.parse(raw) as SiteProfile) }
    } catch {
      // fall through
    }
  }
  return defaultProfile()
}

function defaultProfile(): SiteProfile {
  return {
    name: seedPerson.name,
    email: seedPerson.email,
    github: seedPerson.github,
    linkedin: seedPerson.linkedin,
    city: seedPerson.city,
    monogram: seedPerson.monogram,
    softwareSinceYear: seedPerson.softwareSinceYear,
    portraitPath: null,
    logoPath: null,
    cvPdfPath: null,
  }
}

export function saveSiteProfile(profile: SiteProfile) {
  setSetting('site_profile', JSON.stringify(profile))
}

export function getStackConfig(): StackConfig {
  const raw = getSetting('stack_config')
  const fallback: StackConfig = {
    groups: { ...seedStack },
    moreSkills: [...seedMore],
    dailyDriver: [...seedDaily],
  }
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as StackConfig
    const oldDaily = ['archlinux', 'kde', 'fish', 'cursor', 'claudecode']
    const isOld =
      Array.isArray(parsed.dailyDriver) &&
      parsed.dailyDriver.length === oldDaily.length &&
      oldDaily.every((id, i) => parsed.dailyDriver[i] === id)
    return {
      groups: { ...fallback.groups, ...parsed.groups },
      moreSkills: parsed.moreSkills?.length ? parsed.moreSkills : fallback.moreSkills,
      dailyDriver: isOld || !parsed.dailyDriver?.length ? fallback.dailyDriver : parsed.dailyDriver,
    }
  } catch {
    return fallback
  }
}

export function saveStackConfig(config: StackConfig) {
  setSetting('stack_config', JSON.stringify(config))
}

export function getFooterConfig(): FooterConfig {
  const raw = getSetting('footer_config')
  const profile = getSiteProfile()
  const env = getEnv()
  const fallback: FooterConfig = {
    taglineDe: 'Self-hosted · Next.js',
    taglineEn: 'Self-hosted · Next.js',
    imprintUrl: env.legalImprintUrl ?? '',
    privacyUrl: env.legalPrivacyUrl ?? '',
    repoUrl: 'https://github.com/lytexdev/cv-portfolio',
    showVersion: true,
    socials: [
      { platform: 'github', url: profile.github, label: 'GitHub' },
      { platform: 'linkedin', url: profile.linkedin, label: 'LinkedIn' },
    ],
  }
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as FooterConfig
    return {
      ...fallback,
      ...parsed,
      socials: Array.isArray(parsed.socials) ? parsed.socials : fallback.socials,
    }
  } catch {
    return fallback
  }
}

export function saveFooterConfig(config: FooterConfig) {
  setSetting('footer_config', JSON.stringify(config))
}
