import 'server-only'
import { z } from 'zod'
import { warnOnce } from './log'

const envSchema = z.object({
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  LEGAL_IMPRINT_URL: z.string().url().optional().or(z.literal('')),
  LEGAL_PRIVACY_URL: z.string().url().optional().or(z.literal('')),
  SOURCE_URL: z.string().url().optional().or(z.literal('')),
  BUILD_SHA: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
})

export type AppEnv = {
  publicBaseUrl: string
  legalImprintUrl?: string
  legalPrivacyUrl?: string
  sourceUrl?: string
  buildSha?: string
  isProduction: boolean
}

let cached: AppEnv | null = null

export function getEnv(): AppEnv {
  if (cached) {
    return cached
  }

  const parsed = envSchema.safeParse({
    PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
    LEGAL_IMPRINT_URL: process.env.LEGAL_IMPRINT_URL,
    LEGAL_PRIVACY_URL: process.env.LEGAL_PRIVACY_URL,
    SOURCE_URL: process.env.SOURCE_URL,
    BUILD_SHA: process.env.BUILD_SHA,
    NODE_ENV: process.env.NODE_ENV,
  })

  const data = parsed.success
    ? parsed.data
    : {
        PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
        LEGAL_IMPRINT_URL: process.env.LEGAL_IMPRINT_URL || '',
        LEGAL_PRIVACY_URL: process.env.LEGAL_PRIVACY_URL || '',
        SOURCE_URL: process.env.SOURCE_URL || '',
        BUILD_SHA: process.env.BUILD_SHA,
        NODE_ENV: process.env.NODE_ENV,
      }

  const isProduction = data.NODE_ENV === 'production'
  const imprint = data.LEGAL_IMPRINT_URL || undefined
  const privacy = data.LEGAL_PRIVACY_URL || undefined

  if (isProduction && (!imprint || !privacy)) {
    warnOnce('legal', 'LEGAL_IMPRINT_URL and/or LEGAL_PRIVACY_URL missing in production')
  }

  cached = {
    publicBaseUrl: data.PUBLIC_BASE_URL.replace(/\/$/, ''),
    legalImprintUrl: imprint || undefined,
    legalPrivacyUrl: privacy || undefined,
    sourceUrl: data.SOURCE_URL || undefined,
    buildSha: data.BUILD_SHA || undefined,
    isProduction,
  }

  return cached
}
