import 'server-only'
import type { Locale } from '@/content/types'
import {
  getRuntimeDictionary,
  getRuntimeExperiences,
  listDbProjects,
} from './content-db'
import { getSiteProfile, getStackConfig } from './settings'

const CACHE_TTL_MS = 5 * 60 * 1000

type CacheEntry = { builtAt: number; text: string }

const cache = new Map<Locale, CacheEntry>()

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

export function getAskContext(locale: Locale): string {
  const hit = cache.get(locale)
  if (hit && Date.now() - hit.builtAt < CACHE_TTL_MS) {
    return hit.text
  }

  const dictionary = getRuntimeDictionary(locale)
  const profile = getSiteProfile()
  const stack = getStackConfig()
  const experiences = getRuntimeExperiences()
  const projects = listDbProjects()

  const lines: string[] = [
    `Name: ${profile.name}`,
    `City: ${profile.city}`,
    `Email: ${profile.email}`,
    `Role: ${clip(dictionary.role, 160)}`,
    `Summary: ${clip(dictionary.summary, 420)}`,
    `Availability: ${clip(dictionary.availability, 120)}`,
    `Software since: ${profile.softwareSinceYear}`,
  ]

  lines.push('Experience:')
  for (const exp of experiences) {
    const copy = dictionary.experience.entries[exp.id]
    if (!copy) continue
    const period = exp.end ? `${exp.start}–${exp.end}` : `${exp.start}–present`
    const highlights = copy.highlights
      .slice(0, 3)
      .map((h) => clip(h, 100))
      .join('; ')
    lines.push(
      `- ${copy.role} @ ${copy.company} (${period}, ${copy.location}): ${highlights}`,
    )
  }

  lines.push('Stack:')
  for (const [group, ids] of Object.entries(stack.groups)) {
    if (ids.length === 0) continue
    lines.push(`- ${group}: ${ids.join(', ')}`)
  }
  if (stack.moreSkills.length) {
    lines.push(`- more: ${stack.moreSkills.join(', ')}`)
  }
  if (stack.dailyDriver.length) {
    lines.push(`- daily: ${stack.dailyDriver.join(', ')}`)
  }

  lines.push('Projects:')
  for (const project of projects.slice(0, 14)) {
    const title = project.title[locale] || project.title.de
    const one = project.oneLiner[locale] || project.summary[locale] || ''
    lines.push(
      `- ${project.slug}: ${clip(title, 80)}${one ? ` — ${clip(one, 140)}` : ''} [${project.stack.slice(0, 6).join(', ')}]`,
    )
  }

  lines.push('Languages:')
  for (const lang of dictionary.more.languages) {
    lines.push(`- ${lang.name}: ${lang.level}`)
  }

  lines.push('Interests:')
  for (const label of Object.values(dictionary.more.interests)) {
    lines.push(`- ${label}`)
  }

  lines.push('Strengths:')
  for (const label of Object.values(dictionary.more.strengths)) {
    lines.push(`- ${label}`)
  }

  const text = lines.join('\n')
  cache.set(locale, { builtAt: Date.now(), text })
  return text
}
