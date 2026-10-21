import 'server-only'
import { z } from 'zod'
import { warnOnce } from './log'

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback
  const v = value.trim().toLowerCase()
  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false
  return fallback
}

const envSchema = z.object({
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  PORT: z.coerce.number().int().positive().default(3000),
  VERSION: z.string().default('1.0.0'),
  SECRET_KEY: z.string().min(16),
  SECRET_ADMIN_PHRASE: z.string().min(4),
  LEGAL_IMPRINT_URL: z.string().url().optional().or(z.literal('')),
  LEGAL_PRIVACY_URL: z.string().url().optional().or(z.literal('')),
  DEEPL_API_KEY: z.string().optional().or(z.literal('')),
  MISTRAL_AI_API_KEY: z.string().optional().or(z.literal('')),
  CV_REQUIRE_TOKEN: z.string().optional().or(z.literal('')),
  BUILD_SHA: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
})

export type AppEnv = {
  publicBaseUrl: string
  port: number
  version: string
  secretKey: string
  secretAdminPhrase: string
  legalImprintUrl?: string
  legalPrivacyUrl?: string
  deeplApiKey?: string
  mistralApiKey?: string
  requireToken: boolean
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
    PORT: process.env.PORT,
    VERSION: process.env.VERSION,
    SECRET_KEY: process.env.SECRET_KEY,
    SECRET_ADMIN_PHRASE: process.env.SECRET_ADMIN_PHRASE,
    LEGAL_IMPRINT_URL: process.env.LEGAL_IMPRINT_URL,
    LEGAL_PRIVACY_URL: process.env.LEGAL_PRIVACY_URL,
    DEEPL_API_KEY: process.env.DEEPL_API_KEY,
    MISTRAL_AI_API_KEY: process.env.MISTRAL_AI_API_KEY,
    CV_REQUIRE_TOKEN: process.env.CV_REQUIRE_TOKEN,
    BUILD_SHA: process.env.BUILD_SHA,
    NODE_ENV: process.env.NODE_ENV,
  })

  if (!parsed.success) {
    const fallbackKey = process.env.SECRET_KEY || 'dev-only-insecure-secret-key'
    const fallbackPhrase = process.env.SECRET_ADMIN_PHRASE || 'dev-phrase'
    process.stdout.write(
      `${JSON.stringify({
        ts: new Date().toISOString(),
        evt: 'warn',
        message: 'Env validation incomplete; using fallbacks where needed',
      })}\n`,
    )

    cached = {
      publicBaseUrl: (process.env.PUBLIC_BASE_URL || 'http://localhost:3000').replace(
        /\/$/,
        '',
      ),
      port: Number(process.env.PORT) || 3000,
      version: process.env.VERSION || '1.0.0',
      secretKey: fallbackKey,
      secretAdminPhrase: fallbackPhrase,
      legalImprintUrl: process.env.LEGAL_IMPRINT_URL || undefined,
      legalPrivacyUrl: process.env.LEGAL_PRIVACY_URL || undefined,
      deeplApiKey: process.env.DEEPL_API_KEY || undefined,
      mistralApiKey: process.env.MISTRAL_AI_API_KEY || undefined,
      requireToken: parseBool(process.env.CV_REQUIRE_TOKEN, true),
      buildSha: process.env.BUILD_SHA || undefined,
      isProduction: process.env.NODE_ENV === 'production',
    }
    return cached
  }

  const data = parsed.data
  const isProduction = data.NODE_ENV === 'production'
  const imprint = data.LEGAL_IMPRINT_URL || undefined
  const privacy = data.LEGAL_PRIVACY_URL || undefined

  if (isProduction && (!imprint || !privacy)) {
    warnOnce('legal', 'LEGAL_IMPRINT_URL and/or LEGAL_PRIVACY_URL missing in production')
  }

  cached = {
    publicBaseUrl: data.PUBLIC_BASE_URL.replace(/\/$/, ''),
    port: data.PORT,
    version: data.VERSION,
    secretKey: data.SECRET_KEY,
    secretAdminPhrase: data.SECRET_ADMIN_PHRASE,
    legalImprintUrl: imprint || undefined,
    legalPrivacyUrl: privacy || undefined,
    deeplApiKey: data.DEEPL_API_KEY || undefined,
    mistralApiKey: data.MISTRAL_AI_API_KEY || undefined,
    requireToken: parseBool(data.CV_REQUIRE_TOKEN, true),
    buildSha: data.BUILD_SHA || undefined,
    isProduction,
  }

  return cached
}
