import 'server-only'
import { de } from '@/content/de'
import type { CvDictionary, Locale, ProjectSlug, TechId } from '@/content/types'
import {
  compactProjectOrder as seedCompact,
  experiences as seedExperiences,
  featuredProjectOrder as seedFeatured,
  projects as seedProjects,
  type ExperienceShared,
  type ProjectShared,
} from '@/content/shared'
import { getDictionary } from '@/lib/i18n'
import { getDb } from './db'

export type DbProject = {
  slug: string
  featured: boolean
  sortOrder: number
  stack: TechId[]
  images: string[]
  href?: string
  title: { de: string; en: string }
  kicker: { de: string; en: string }
  summary: { de: string; en: string }
  oneLiner: { de: string; en: string }
  highlights: { de: string[]; en: string[] }
  imagesMeta: {
    de: Record<string, { alt: string; caption: string }>
    en: Record<string, { alt: string; caption: string }>
  }
}

export type DbExperience = {
  id: string
  sortOrder: number
  start: string
  end: string | null
  stack: TechId[]
  projectLinks: ProjectSlug[]
  companyUrl?: string
  role: { de: string; en: string }
  company: { de: string; en: string }
  location: { de: string; en: string }
  highlights: { de: string[]; en: string[] }
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function listDbProjects(): DbProject[] {
  const rows = getDb()
    .prepare('SELECT * FROM projects ORDER BY sort_order ASC, slug ASC')
    .all() as Record<string, unknown>[]

  return rows.map((row) => {
    const imagesMeta = parseJson<{
      de?: Record<string, { alt: string; caption: string }>
      en?: Record<string, { alt: string; caption: string }>
    }>(String(row.images_meta_json ?? '{}'), {})
    return {
      slug: String(row.slug),
      featured: Boolean(row.featured),
      sortOrder: Number(row.sort_order),
      stack: parseJson<TechId[]>(String(row.stack_json), []),
      images: parseJson<string[]>(String(row.images_json), []),
      href: row.href ? String(row.href) : undefined,
      title: { de: String(row.title_de), en: String(row.title_en) },
      kicker: { de: String(row.kicker_de), en: String(row.kicker_en) },
      summary: { de: String(row.summary_de), en: String(row.summary_en) },
      oneLiner: { de: String(row.one_liner_de), en: String(row.one_liner_en) },
      highlights: {
        de: parseJson<string[]>(String(row.highlights_de_json), []),
        en: parseJson<string[]>(String(row.highlights_en_json), []),
      },
      imagesMeta: {
        de: imagesMeta.de ?? {},
        en: imagesMeta.en ?? {},
      },
    }
  })
}

export function listDbExperiences(): DbExperience[] {
  const rows = getDb()
    .prepare('SELECT * FROM experience ORDER BY sort_order ASC')
    .all() as Record<string, unknown>[]

  return rows.map((row) => ({
    id: String(row.id),
    sortOrder: Number(row.sort_order),
    start: String(row.start_date),
    end: row.end_date ? String(row.end_date) : null,
    stack: parseJson<TechId[]>(String(row.stack_json), []),
    projectLinks: parseJson<ProjectSlug[]>(String(row.project_links_json), []),
    companyUrl: row.company_url ? String(row.company_url) : undefined,
    role: { de: String(row.role_de), en: String(row.role_en) },
    company: { de: String(row.company_de), en: String(row.company_en) },
    location: { de: String(row.location_de), en: String(row.location_en) },
    highlights: {
      de: parseJson<string[]>(String(row.highlights_de_json), []),
      en: parseJson<string[]>(String(row.highlights_en_json), []),
    },
  }))
}

export function getContentString(key: string, locale: Locale): string | null {
  const row = getDb()
    .prepare('SELECT value FROM content_strings WHERE key = ? AND locale = ?')
    .get(key, locale) as { value: string } | undefined
  return row?.value ?? null
}

export function listContentStrings(locale?: Locale) {
  const db = getDb()
  if (locale) {
    return db
      .prepare(
        'SELECT key, locale, value FROM content_strings WHERE locale = ? ORDER BY key',
      )
      .all(locale) as Array<{ key: string; locale: string; value: string }>
  }
  return db
    .prepare('SELECT key, locale, value FROM content_strings ORDER BY key, locale')
    .all() as Array<{ key: string; locale: string; value: string }>
}

export function setContentString(key: string, locale: Locale, value: string) {
  getDb()
    .prepare(
      `INSERT INTO content_strings (key, locale, value) VALUES (?, ?, ?)
       ON CONFLICT(key, locale) DO UPDATE SET value = excluded.value`,
    )
    .run(key, locale, value)
}

function setPath(target: Record<string, unknown>, pathKey: string, value: string) {
  const parts = pathKey.split('.').filter(Boolean)
  if (parts.length === 0) return
  let cursor: Record<string, unknown> = target
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    const next = cursor[part]
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      cursor[part] = {}
    }
    cursor = cursor[part] as Record<string, unknown>
  }
  const leaf = parts[parts.length - 1]!
  if (value.startsWith('[') || value.startsWith('{')) {
    try {
      cursor[leaf] = JSON.parse(value)
      return
    } catch {
      // fall through
    }
  }
  cursor[leaf] = value
}

export function getRuntimeDictionary(locale: Locale): CvDictionary {
  const base = structuredClone(getDictionary(locale)) as CvDictionary
  const strings = listContentStrings(locale)
  const asRecord = base as unknown as Record<string, unknown>
  for (const row of strings) {
    setPath(asRecord, row.key, row.value)
  }

  const projects = listDbProjects()
  const featured: Record<string, unknown> = {}
  const compact: Record<string, unknown> = {}

  for (const project of projects) {
    const images = project.imagesMeta[locale] ?? {}
    if (project.featured) {
      featured[project.slug] = {
        kicker: project.kicker[locale],
        title: project.title[locale],
        summary: project.summary[locale],
        highlights: project.highlights[locale],
        linkLabel: locale === 'de' ? 'Zur Website' : 'Visit website',
        images,
      }
    } else {
      compact[project.slug] = {
        kicker: project.kicker[locale],
        title: project.title[locale],
        oneLiner: project.oneLiner[locale],
        highlights: project.highlights[locale],
        images,
      }
    }
  }

  base.projects.featured = featured as CvDictionary['projects']['featured']
  base.projects.compact = compact as CvDictionary['projects']['compact']

  const experiences = listDbExperiences()
  const entries: CvDictionary['experience']['entries'] = {
    ...base.experience.entries,
  }
  for (const exp of experiences) {
    entries[exp.id as keyof typeof entries] = {
      role: exp.role[locale],
      company: exp.company[locale],
      location: exp.location[locale],
      highlights: exp.highlights[locale],
    }
  }
  base.experience.entries = entries

  return base
}

export function getRuntimeProjects(): Record<string, ProjectShared> {
  const out: Record<string, ProjectShared> = { ...seedProjects }
  for (const project of listDbProjects()) {
    out[project.slug] = {
      slug: project.slug as ProjectSlug,
      featured: project.featured,
      stack: project.stack,
      images: project.images,
      href: project.href,
    }
  }
  return out
}

export function getRuntimeFeaturedOrder(): ProjectSlug[] {
  return listDbProjects()
    .filter((p) => p.featured)
    .map((p) => p.slug as ProjectSlug)
}

export function getRuntimeCompactOrder(): ProjectSlug[] {
  return listDbProjects()
    .filter((p) => !p.featured)
    .map((p) => p.slug as ProjectSlug)
}

export function getRuntimeExperiences(): ExperienceShared[] {
  const fromDb = listDbExperiences()
  if (fromDb.length === 0) return seedExperiences
  return fromDb.map((exp) => ({
    id: exp.id as ExperienceShared['id'],
    start: exp.start,
    end: exp.end,
    stack: exp.stack,
    projectLinks: exp.projectLinks,
    companyUrl: exp.companyUrl,
  }))
}

export function upsertProject(project: DbProject) {
  getDb()
    .prepare(
      `INSERT INTO projects (
        slug, featured, sort_order, stack_json, images_json, href,
        title_de, title_en, kicker_de, kicker_en, summary_de, summary_en,
        one_liner_de, one_liner_en, highlights_de_json, highlights_en_json, images_meta_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        featured = excluded.featured,
        sort_order = excluded.sort_order,
        stack_json = excluded.stack_json,
        images_json = excluded.images_json,
        href = excluded.href,
        title_de = excluded.title_de,
        title_en = excluded.title_en,
        kicker_de = excluded.kicker_de,
        kicker_en = excluded.kicker_en,
        summary_de = excluded.summary_de,
        summary_en = excluded.summary_en,
        one_liner_de = excluded.one_liner_de,
        one_liner_en = excluded.one_liner_en,
        highlights_de_json = excluded.highlights_de_json,
        highlights_en_json = excluded.highlights_en_json,
        images_meta_json = excluded.images_meta_json`,
    )
    .run(
      project.slug,
      project.featured ? 1 : 0,
      project.sortOrder,
      JSON.stringify(project.stack),
      JSON.stringify(project.images),
      project.href ?? null,
      project.title.de,
      project.title.en,
      project.kicker.de,
      project.kicker.en,
      project.summary.de,
      project.summary.en,
      project.oneLiner.de,
      project.oneLiner.en,
      JSON.stringify(project.highlights.de),
      JSON.stringify(project.highlights.en),
      JSON.stringify(project.imagesMeta),
    )
}

export function deleteProject(slug: string) {
  getDb().prepare('DELETE FROM projects WHERE slug = ?').run(slug)
}

export function upsertExperience(exp: DbExperience) {
  getDb()
    .prepare(
      `INSERT INTO experience (
        id, sort_order, start_date, end_date, stack_json, project_links_json,
        company_url, role_de, role_en, company_de, company_en, location_de, location_en,
        highlights_de_json, highlights_en_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        sort_order = excluded.sort_order,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        stack_json = excluded.stack_json,
        project_links_json = excluded.project_links_json,
        company_url = excluded.company_url,
        role_de = excluded.role_de,
        role_en = excluded.role_en,
        company_de = excluded.company_de,
        company_en = excluded.company_en,
        location_de = excluded.location_de,
        location_en = excluded.location_en,
        highlights_de_json = excluded.highlights_de_json,
        highlights_en_json = excluded.highlights_en_json`,
    )
    .run(
      exp.id,
      exp.sortOrder,
      exp.start,
      exp.end,
      JSON.stringify(exp.stack),
      JSON.stringify(exp.projectLinks),
      exp.companyUrl ?? null,
      exp.role.de,
      exp.role.en,
      exp.company.de,
      exp.company.en,
      exp.location.de,
      exp.location.en,
      JSON.stringify(exp.highlights.de),
      JSON.stringify(exp.highlights.en),
    )
}

export function deleteExperience(id: string) {
  getDb().prepare('DELETE FROM experience WHERE id = ?').run(id)
}

export { seedFeatured, seedCompact, de }
