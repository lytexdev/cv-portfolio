'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  attemptLogin,
  getAdminById,
  setTotpSecret,
  updateAdminCredentials,
} from '@/lib/server/admin-auth'
import {
  deleteExperience,
  deleteProject,
  listDbExperiences,
  listDbProjects,
  setContentString,
  upsertExperience,
  upsertProject,
  type DbExperience,
  type DbProject,
} from '@/lib/server/content-db'
import { createCsrfToken, verifyCsrfToken } from '@/lib/server/csrf'
import { translateDeToEn } from '@/lib/server/deepl'
import { logEvent } from '@/lib/server/log'
import { updateBirthDate } from '@/lib/server/private-data'
import {
  SOCIAL_PLATFORMS,
  getSiteProfile,
  getStackConfig,
  normalizeSpokenLanguages,
  saveFooterConfig,
  saveSiteProfile,
  saveSpokenLanguages,
  saveStackConfig,
  type FooterConfig,
  type SiteProfile,
  type SocialLink,
  type SocialPlatform,
  type StackConfig,
} from '@/lib/server/settings'
import {
  processProjectImage,
  processSiteImage,
  processSitePdf,
} from '@/lib/server/uploads'
import {
  clearAdminSessionCookie,
  createSessionToken,
  getAdminSession,
  setAdminSessionCookie,
} from '@/lib/server/session'
import {
  createToken,
  deleteToken,
  revealTokenPlaintext,
  revokeToken,
  updateToken,
} from '@/lib/server/tokens'
import { createTotpUri, generateBase32Secret, verifyTotp } from '@/lib/server/totp'
import { parseTechIds } from '@/components/icons/registry'
import type { Locale, StackGroupId, TechId } from '@/content/types'

async function requireSession() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/sudo/login')
  }
  return session
}

function formString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function revalidatePublicCv() {
  revalidatePath('/', 'layout')
  revalidatePath('/de')
  revalidatePath('/en')
  revalidatePath('/de', 'page')
  revalidatePath('/en', 'page')
}

function formFile(formData: FormData, key: string): File | null {
  const value = formData.get(key)
  if (!value || typeof value === 'string') return null
  if (typeof value.arrayBuffer !== 'function' || typeof value.size !== 'number') {
    return null
  }
  if (value.size <= 0) return null
  return value as File
}

async function assertCsrf(formData: FormData, sessionKey: string) {
  const token = formString(formData, 'csrf')
  if (!verifyCsrfToken(sessionKey, token)) {
    throw new Error('Invalid CSRF token')
  }
}

export async function loginAction(formData: FormData) {
  const h = await headers()
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'

  const result = attemptLogin({
    username: formString(formData, 'username'),
    password: formString(formData, 'password'),
    phrase: formString(formData, 'phrase'),
    totp: formString(formData, 'totp') || undefined,
    ip,
  })

  if (!result.ok) {
    logEvent({ evt: 'admin_login_failed', ip })
    redirect(`/sudo/login?error=${encodeURIComponent(result.error)}`)
  }

  const token = await createSessionToken({
    adminId: result.admin.id,
    username: result.admin.username,
    mustChange: Boolean(result.admin.must_change_credentials),
  })
  await setAdminSessionCookie(token)
  logEvent({ evt: 'admin_login', adminId: result.admin.id })

  if (result.admin.must_change_credentials) {
    redirect('/sudo/setup')
  }
  redirect('/sudo')
}

export async function logoutAction() {
  await clearAdminSessionCookie()
  redirect('/sudo/login')
}

export async function setupCredentialsAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))

  const username = formString(formData, 'username')
  const password = formString(formData, 'password')
  const confirm = formString(formData, 'confirm')
  if (username.length < 3 || password.length < 10 || password !== confirm) {
    redirect('/sudo/setup?error=invalid')
  }

  updateAdminCredentials(session.adminId, { username, password })
  const token = await createSessionToken({
    adminId: session.adminId,
    username,
    mustChange: false,
  })
  await setAdminSessionCookie(token)
  redirect('/sudo/setup?totp=1')
}

export async function enableTotpAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const secret = formString(formData, 'secret')
  const code = formString(formData, 'code')
  if (!verifyTotp(secret, code)) {
    redirect('/sudo/setup?totp=1&error=totp')
  }
  setTotpSecret(session.adminId, secret, true)
  redirect('/sudo')
}

export async function skipTotpAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  redirect('/sudo')
}

export async function createTokenAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const label = formString(formData, 'label')
  const role = formString(formData, 'role') || undefined
  const expiresRaw = formString(formData, 'expiresAt')
  let expiresAt: string | null = null
  if (expiresRaw) {
    const parsed = Date.parse(expiresRaw)
    expiresAt = Number.isNaN(parsed) ? null : new Date(parsed).toISOString()
  }
  if (!label) redirect('/sudo/tokens?error=label')
  const created = createToken({ label, role, expiresAt })
  revalidatePath('/sudo/tokens')
  redirect(`/sudo/tokens?created=${encodeURIComponent(created.plaintext)}`)
}

export async function revokeTokenAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  revokeToken(formString(formData, 'id'))
  revalidatePath('/sudo/tokens')
  redirect('/sudo/tokens')
}

export async function deleteTokenAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  deleteToken(formString(formData, 'id'))
  revalidatePath('/sudo/tokens')
  redirect('/sudo/tokens')
}

export async function updateTokenAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const expiresRaw = formString(formData, 'expiresAt')
  let expiresAt: string | null = null
  if (expiresRaw) {
    const parsed = Date.parse(expiresRaw)
    expiresAt = Number.isNaN(parsed) ? null : new Date(parsed).toISOString()
  }
  updateToken(formString(formData, 'id'), {
    label: formString(formData, 'label'),
    role: formString(formData, 'role') || null,
    expiresAt,
  })
  revalidatePath('/sudo/tokens')
  redirect('/sudo/tokens')
}

export async function saveProjectAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))

  const slug = formString(formData, 'slug')
  const existing = listDbProjects().find((p) => p.slug === slug)
  const project: DbProject = {
    slug,
    featured: formString(formData, 'featured') === '1',
    sortOrder: Number(formString(formData, 'sortOrder') || '0'),
    stack: parseTechIds(formString(formData, 'stack')),
    images: formString(formData, 'images')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    href: formString(formData, 'href') || undefined,
    title: {
      de: formString(formData, 'title_de'),
      en: formString(formData, 'title_en'),
    },
    kicker: {
      de: formString(formData, 'kicker_de'),
      en: formString(formData, 'kicker_en'),
    },
    summary: {
      de: formString(formData, 'summary_de'),
      en: formString(formData, 'summary_en'),
    },
    oneLiner: {
      de: formString(formData, 'one_liner_de'),
      en: formString(formData, 'one_liner_en'),
    },
    highlights: {
      de: formString(formData, 'highlights_de')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      en: formString(formData, 'highlights_en')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    },
    imagesMeta: existing?.imagesMeta ?? { de: {}, en: {} },
  }

  upsertProject(project)
  revalidatePath('/sudo/projects')
  revalidatePath('/de')
  revalidatePath('/en')
  redirect(`/sudo/projects?saved=${encodeURIComponent(slug)}`)
}

export async function deleteProjectAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  deleteProject(formString(formData, 'slug'))
  revalidatePath('/sudo/projects')
  redirect('/sudo/projects')
}

export async function translateProjectAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const slug = formString(formData, 'slug')
  const project = listDbProjects().find((p) => p.slug === slug)
  if (!project) redirect('/sudo/projects')

  project.title.en = await translateDeToEn(project.title.de)
  project.kicker.en = await translateDeToEn(project.kicker.de || project.title.de)
  if (project.summary.de) {
    project.summary.en = await translateDeToEn(project.summary.de)
  }
  if (project.oneLiner.de) {
    project.oneLiner.en = await translateDeToEn(project.oneLiner.de)
  }
  project.highlights.en = await Promise.all(
    project.highlights.de.map((h) => translateDeToEn(h)),
  )
  upsertProject(project)
  revalidatePath('/sudo/projects')
  redirect(`/sudo/projects?edited=${encodeURIComponent(slug)}&translated=1`)
}

export async function uploadProjectImageAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const slug = formString(formData, 'slug')
  const file = formFile(formData, 'file')
  if (!file || !slug) {
    redirect(`/sudo/projects?edited=${encodeURIComponent(slug)}&error=upload`)
  }
  try {
    const buf = Buffer.from(await file.arrayBuffer())
    const base = formString(formData, 'name') || `img-${Date.now()}`
    const result = await processProjectImage(
      slug,
      base.replace(/[^a-z0-9_-]/gi, '') || `img-${Date.now()}`,
      buf,
    )
    const project = listDbProjects().find((p) => p.slug === slug)
    if (project) {
      if (!project.images.includes(result.filename)) {
        project.images.push(result.filename)
      }
      upsertProject(project)
    }
  } catch {
    redirect(`/sudo/projects?edited=${encodeURIComponent(slug)}&error=upload`)
  }
  revalidatePath('/sudo/projects')
  redirect(`/sudo/projects?edited=${encodeURIComponent(slug)}&uploaded=1`)
}

export async function removeProjectImageAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const slug = formString(formData, 'slug')
  const filename = formString(formData, 'filename')
  const project = listDbProjects().find((p) => p.slug === slug)
  if (project && filename) {
    project.images = project.images.filter((name) => name !== filename)
    upsertProject(project)
  }
  revalidatePath('/sudo/projects')
  redirect(`/sudo/projects?edited=${encodeURIComponent(slug)}`)
}

export async function saveExperienceAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const projectLinks = formData
    .getAll('projectLinks')
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean) as DbExperience['projectLinks']
  const exp: DbExperience = {
    id: formString(formData, 'id'),
    sortOrder: Number(formString(formData, 'sortOrder') || '0'),
    start: formString(formData, 'start'),
    end: formString(formData, 'end') || null,
    stack: parseTechIds(formString(formData, 'stack')),
    projectLinks,
    companyUrl: formString(formData, 'companyUrl') || undefined,
    role: {
      de: formString(formData, 'role_de'),
      en: formString(formData, 'role_en'),
    },
    company: {
      de: formString(formData, 'company_de'),
      en: formString(formData, 'company_en'),
    },
    location: {
      de: formString(formData, 'location_de'),
      en: formString(formData, 'location_en'),
    },
    highlights: {
      de: formString(formData, 'highlights_de')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      en: formString(formData, 'highlights_en')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    },
  }
  upsertExperience(exp)
  revalidatePath('/sudo/experience')
  revalidatePath('/de')
  revalidatePath('/en')
  redirect(`/sudo/experience?edited=${encodeURIComponent(exp.id)}&saved=1`)
}

export async function moveExperienceAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const id = formString(formData, 'id')
  const direction = formString(formData, 'direction')
  const items = listDbExperiences()
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) redirect('/sudo/experience')
  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= items.length) {
    redirect(`/sudo/experience?edited=${encodeURIComponent(id)}`)
  }
  const current = items[index]!
  const neighbor = items[swapIndex]!
  const currentOrder = current.sortOrder
  current.sortOrder = neighbor.sortOrder
  neighbor.sortOrder = currentOrder
  if (current.sortOrder === neighbor.sortOrder) {
    current.sortOrder = swapIndex
    neighbor.sortOrder = index
  }
  upsertExperience(current)
  upsertExperience(neighbor)
  revalidatePath('/sudo/experience')
  revalidatePath('/de')
  revalidatePath('/en')
  redirect(`/sudo/experience?edited=${encodeURIComponent(id)}`)
}

export async function moveProjectAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const slug = formString(formData, 'slug')
  const direction = formString(formData, 'direction')
  const items = listDbProjects()
  const index = items.findIndex((item) => item.slug === slug)
  if (index < 0) redirect('/sudo/projects')
  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= items.length) {
    redirect(`/sudo/projects?edited=${encodeURIComponent(slug)}`)
  }
  const current = items[index]!
  const neighbor = items[swapIndex]!
  const currentOrder = current.sortOrder
  current.sortOrder = neighbor.sortOrder
  neighbor.sortOrder = currentOrder
  if (current.sortOrder === neighbor.sortOrder) {
    current.sortOrder = swapIndex
    neighbor.sortOrder = index
  }
  upsertProject(current)
  upsertProject(neighbor)
  revalidatePath('/sudo/projects')
  revalidatePath('/de')
  revalidatePath('/en')
  redirect(`/sudo/projects?edited=${encodeURIComponent(slug)}`)
}

export async function deleteExperienceAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  deleteExperience(formString(formData, 'id'))
  revalidatePath('/sudo/experience')
  redirect('/sudo/experience')
}

export async function translateExperienceAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const id = formString(formData, 'id')
  const exp = listDbExperiences().find((e) => e.id === id)
  if (!exp) redirect('/sudo/experience')
  exp.role.en = await translateDeToEn(exp.role.de)
  exp.company.en = await translateDeToEn(exp.company.de)
  exp.location.en = await translateDeToEn(exp.location.de)
  exp.highlights.en = await Promise.all(
    exp.highlights.de.map((h) => translateDeToEn(h)),
  )
  upsertExperience(exp)
  revalidatePath('/sudo/experience')
  redirect(`/sudo/experience?edited=${encodeURIComponent(id)}&translated=1`)
}

export async function saveContentAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const key = formString(formData, 'key')
  const locale = formString(formData, 'locale') as Locale
  const value = String(formData.get('value') ?? '')
  setContentString(key, locale, value)
  revalidatePath('/sudo/content')
  revalidatePublicCv()
  redirect(
    `/sudo/content?key=${encodeURIComponent(key)}&saved=${Date.now()}`,
  )
}

export async function saveContentPairAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const key = formString(formData, 'key')
  const valueDe = String(formData.get('value_de') ?? '')
  const valueEn = String(formData.get('value_en') ?? '')
  setContentString(key, 'de', valueDe)
  setContentString(key, 'en', valueEn)
  revalidatePath('/sudo/content')
  revalidatePublicCv()
  redirect(
    `/sudo/content?key=${encodeURIComponent(key)}&saved=${Date.now()}`,
  )
}

export async function translateContentAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const key = formString(formData, 'key')
  const valueDe = String(formData.get('value_de') ?? '')
  const translated = await translateDeToEn(valueDe)
  setContentString(key, 'de', valueDe)
  setContentString(key, 'en', translated)
  revalidatePath('/sudo/content')
  revalidatePublicCv()
  redirect(
    `/sudo/content?key=${encodeURIComponent(key)}&translated=${Date.now()}`,
  )
}

export async function csrfFor(sessionId: string) {
  return createCsrfToken(sessionId)
}

export async function getTotpSetup(username: string) {
  const secret = generateBase32Secret()
  return { secret, uri: createTotpUri(secret, username) }
}

export async function ensureAdminOrRedirect() {
  const session = await getAdminSession()
  if (!session) redirect('/sudo/login')
  if (session.mustChange) redirect('/sudo/setup')
  const admin = getAdminById(session.adminId)
  if (!admin) {
    await clearAdminSessionCookie()
    redirect('/sudo/login')
  }
  return session
}

export async function saveSiteProfileAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const current = getSiteProfile()
  const next: SiteProfile = {
    ...current,
    name: formString(formData, 'name') || current.name,
    email: formString(formData, 'email') || current.email,
    github: formString(formData, 'github') || current.github,
    linkedin: formString(formData, 'linkedin') || current.linkedin,
    city: formString(formData, 'city') || current.city,
    monogram: formString(formData, 'monogram') || current.monogram,
  }
  saveSiteProfile(next)
  const birthDate = formString(formData, 'birthDate')
  if (birthDate) {
    updateBirthDate(birthDate)
  }
  revalidatePath('/sudo')
  revalidatePublicCv()
  redirect('/sudo?saved=profile')
}

export async function uploadSiteAssetAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const kind = formString(formData, 'kind')
  const file = formFile(formData, 'file')
  if (!file || (kind !== 'portrait' && kind !== 'logo' && kind !== 'pdf')) {
    redirect('/sudo?error=upload')
  }
  try {
    const buf = Buffer.from(await file.arrayBuffer())
    const profile = getSiteProfile()
    if (kind === 'pdf') {
      profile.cvPdfPath = await processSitePdf(buf)
    } else {
      const url = await processSiteImage(kind, buf)
      if (kind === 'portrait') profile.portraitPath = url
      else profile.logoPath = url
    }
    saveSiteProfile(profile)
  } catch {
    redirect('/sudo?error=upload')
  }
  revalidatePath('/sudo')
  revalidatePublicCv()
  redirect('/sudo?saved=asset')
}

export async function saveStackConfigAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const current = getStackConfig()
  const parseList = (key: string): TechId[] => parseTechIds(formString(formData, key))

  const groups = { ...current.groups }
  for (const group of Object.keys(groups) as StackGroupId[]) {
    groups[group] = parseList(`group_${group}`)
  }
  const next: StackConfig = {
    groups,
    moreSkills: parseList('moreSkills'),
    dailyDriver: parseList('dailyDriver'),
  }
  saveStackConfig(next)
  revalidatePath('/sudo/stack')
  revalidatePath('/de')
  revalidatePath('/en')
  redirect('/sudo/stack?saved=1')
}

export async function saveSpokenLanguagesAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  const codes = formData.getAll('languageCode').map(String)
  const levels = formData.getAll('languageLevel').map(String)
  saveSpokenLanguages(
    normalizeSpokenLanguages(codes.map((code, index) => ({ code, level: levels[index] }))),
  )
  revalidatePath('/sudo/languages')
  revalidatePublicCv()
  redirect('/sudo/languages?saved=1')
}

export async function saveFooterConfigAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))

  const platforms = formData.getAll('socialPlatform').map(String)
  const urls = formData.getAll('socialUrl').map(String)
  const labels = formData.getAll('socialLabel').map(String)
  const socials: SocialLink[] = []

  for (let i = 0; i < platforms.length; i += 1) {
    const platform = platforms[i] as SocialPlatform | undefined
    const url = (urls[i] ?? '').trim()
    const label = (labels[i] ?? '').trim()
    if (!platform || !SOCIAL_PLATFORMS.includes(platform) || !url) continue
    socials.push({ platform, url, label: label || platform })
  }

  const next: FooterConfig = {
    taglineDe: formString(formData, 'taglineDe'),
    taglineEn: formString(formData, 'taglineEn'),
    imprintUrl: formString(formData, 'imprintUrl'),
    privacyUrl: formString(formData, 'privacyUrl'),
    repoUrl: formString(formData, 'repoUrl'),
    showVersion: formData.get('showVersion') === 'on',
    socials,
  }
  saveFooterConfig(next)
  revalidatePath('/sudo/footer')
  revalidatePath('/de')
  revalidatePath('/en')
  redirect('/sudo/footer?saved=1')
}

export async function getTokenPlaintextAction(formData: FormData) {
  const session = await requireSession()
  await assertCsrf(formData, String(session.adminId))
  return revealTokenPlaintext(formString(formData, 'id'))
}
