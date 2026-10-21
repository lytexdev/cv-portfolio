import type { CvDictionary, Locale } from '@/content/types'

const TIME_ZONE = 'Europe/Berlin'

function partsInBerlin(date: Date): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)
  return { year, month, day }
}

export function calculateAge(birthDateIso: string, now = new Date()): number {
  const birth = new Date(`${birthDateIso}T00:00:00Z`)
  const nowParts = partsInBerlin(now)
  const birthParts = partsInBerlin(birth)
  let age = nowParts.year - birthParts.year
  if (
    nowParts.month < birthParts.month ||
    (nowParts.month === birthParts.month && nowParts.day < birthParts.day)
  ) {
    age -= 1
  }
  return age
}

export function formatMonthYear(isoDate: string, locale: Locale): string {
  const date = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`)
  if (locale === 'de') {
    const { year, month } = partsInBerlin(date)
    return `${String(month).padStart(2, '0')}/${year}`
  }
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDuration(
  startIso: string,
  endIso: string | null,
  dictionary: CvDictionary,
  now = new Date(),
): string {
  const start = partsInBerlin(new Date(`${startIso.slice(0, 10)}T12:00:00Z`))
  const end = endIso
    ? partsInBerlin(new Date(`${endIso.slice(0, 10)}T12:00:00Z`))
    : partsInBerlin(now)

  let months = (end.year - start.year) * 12 + (end.month - start.month)
  if (end.day < start.day) {
    months -= 1
  }
  if (months < 0) {
    months = 0
  }

  const years = Math.floor(months / 12)
  const remMonths = months % 12
  const parts: string[] = []

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? dictionary.duration.year : dictionary.duration.years}`)
  }
  if (remMonths > 0 || years === 0) {
    parts.push(
      `${remMonths} ${remMonths === 1 ? dictionary.duration.month : dictionary.duration.months}`,
    )
  }

  return parts.join(' ')
}

export function formatRange(
  startIso: string,
  endIso: string | null,
  locale: Locale,
  dictionary: CvDictionary,
): string {
  const start = formatMonthYear(startIso, locale)
  if (!endIso) {
    return dictionary.experience.since.replace('{date}', start)
  }
  const end = formatMonthYear(endIso, locale)
  return `${start} - ${end}`
}

export function formatBirthDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T12:00:00Z`)
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
