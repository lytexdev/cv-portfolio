import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { getDataDir } from './data-dir'
import { warnOnce } from './log'

const TOKEN_REGEX = /^[A-Za-z0-9_-]{32}$/

const tokenEntrySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  role: z.string().optional(),
  hash: z.string().length(64),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  revoked: z.boolean(),
})

const tokensFileSchema = z.object({
  version: z.literal(1),
  tokens: z.array(tokenEntrySchema),
})

export type TokenEntry = z.infer<typeof tokenEntrySchema>
export type TokensFile = z.infer<typeof tokensFileSchema>

type CacheState = {
  data: TokensFile | null
  mtimeMs: number
  checkedAt: number
}

const CACHE_TTL_MS = 10_000
let cache: CacheState = { data: null, mtimeMs: 0, checkedAt: 0 }

function tokensPath(): string {
  return path.join(getDataDir(), 'tokens.json')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

function loadFromDisk(): TokensFile | null {
  const filePath = tokensPath()
  try {
    const raw = readFileSync(filePath, 'utf8')
    const parsed = tokensFileSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      process.stdout.write(
        `${JSON.stringify({ ts: new Date().toISOString(), evt: 'error', message: 'Invalid tokens.json' })}\n`,
      )
      return cache.data
    }
    return parsed.data
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      warnOnce('tokens', 'tokens.json not found')
      return cache.data
    }
    process.stdout.write(
      `${JSON.stringify({ ts: new Date().toISOString(), evt: 'error', message: 'Failed to read tokens.json' })}\n`,
    )
    return cache.data
  }
}

export function getTokensFile(): TokensFile | null {
  const now = Date.now()
  if (now - cache.checkedAt < CACHE_TTL_MS && cache.data) {
    return cache.data
  }

  cache.checkedAt = now
  const filePath = tokensPath()

  try {
    const { mtimeMs } = statSync(filePath)
    if (cache.data && mtimeMs === cache.mtimeMs) {
      return cache.data
    }
    const data = loadFromDisk()
    if (data) {
      cache = { data, mtimeMs, checkedAt: now }
    }
    return cache.data
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      warnOnce('tokens', 'tokens.json not found')
      return cache.data
    }
    return cache.data
  }
}

export function isValidTokenFormat(token: string): boolean {
  return TOKEN_REGEX.test(token)
}

export function findTokenByPlaintext(token: string): TokenEntry | null {
  if (!isValidTokenFormat(token)) {
    return null
  }

  const file = getTokensFile()
  if (!file) {
    return null
  }

  const digest = Buffer.from(hashToken(token), 'hex')
  let match: TokenEntry | null = null

  for (const entry of file.tokens) {
    try {
      const entryHash = Buffer.from(entry.hash, 'hex')
      if (entryHash.length !== digest.length) {
        continue
      }
      if (timingSafeEqual(entryHash, digest)) {
        match = entry
      }
    } catch {
      continue
    }
  }

  return match
}

export { hashToken, TOKEN_REGEX }
