import { de } from '@/content/de'
import { en } from '@/content/en'
import type { CvDictionary, Locale } from '@/content/types'

export const locales = ['de', 'en'] as const

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export function getDictionary(locale: Locale): CvDictionary {
  return locale === 'en' ? en : de
}
