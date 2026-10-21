import 'server-only'
import { mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { calculateAge } from '@/lib/dates'
import { getDataDir } from './data-dir'
import { warnOnce } from './log'

const privateSchema = z.object({
  phone: z.string().min(1),
  street: z.string().min(1),
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type PrivateData = z.infer<typeof privateSchema>

type CacheState = {
  data: PrivateData | null
  mtimeMs: number
  checkedAt: number
}

const CACHE_TTL_MS = 10_000
let cache: CacheState = { data: null, mtimeMs: 0, checkedAt: 0 }

function privatePath(): string {
  return path.join(getDataDir(), 'private.json')
}

function loadFromDisk(): PrivateData | null {
  const filePath = privatePath()
  try {
    const raw = readFileSync(filePath, 'utf8')
    const parsed = privateSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      process.stdout.write(
        `${JSON.stringify({ ts: new Date().toISOString(), evt: 'error', message: 'Invalid private.json' })}\n`,
      )
      return cache.data
    }
    return parsed.data
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      warnOnce('private', 'private.json not found')
      return null
    }
    process.stdout.write(
      `${JSON.stringify({ ts: new Date().toISOString(), evt: 'error', message: 'Failed to read private.json' })}\n`,
    )
    return cache.data
  }
}

export function getPrivateData(): PrivateData | null {
  const now = Date.now()
  if (now - cache.checkedAt < CACHE_TTL_MS && cache.data) {
    return cache.data
  }

  cache.checkedAt = now
  const filePath = privatePath()

  try {
    const { mtimeMs } = statSync(filePath)
    if (cache.data && mtimeMs === cache.mtimeMs) {
      return cache.data
    }
    const data = loadFromDisk()
    if (data) {
      cache = { data, mtimeMs, checkedAt: now }
    } else if (!cache.data) {
      cache = { data: null, mtimeMs: 0, checkedAt: now }
    }
    return cache.data
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      warnOnce('private', 'private.json not found')
      return null
    }
    return cache.data
  }
}

export function getPublicAge(): number | null {
  const data = getPrivateData()
  if (!data) {
    return null
  }
  return calculateAge(data.birthDate)
}

export function updateBirthDate(birthDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return false
  }
  const current = getPrivateData()
  if (!current) {
    return false
  }
  const next = { ...current, birthDate }
  const dir = getDataDir()
  mkdirSync(dir, { recursive: true })
  const filePath = privatePath()
  const tempPath = path.join(dir, `.private.${process.pid}.${Date.now()}.tmp`)
  writeFileSync(tempPath, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600 })
  renameSync(tempPath, filePath)
  cache = { data: next, mtimeMs: Date.now(), checkedAt: Date.now() }
  return true
}
