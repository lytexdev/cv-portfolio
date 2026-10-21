import 'server-only'
import { DatabaseSync } from 'node:sqlite'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { de } from '@/content/de'
import { en } from '@/content/en'
import * as shared from '@/content/shared'
import { getDataDir } from './data-dir'
import { hashPassword } from './password'
import { logEvent } from './log'

let db: DatabaseSync | null = null
let seeded = false

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  totp_secret TEXT,
  totp_enabled INTEGER NOT NULL DEFAULT 0,
  must_change_credentials INTEGER NOT NULL DEFAULT 1,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  role TEXT,
  hash TEXT NOT NULL UNIQUE,
  sealed TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  revoked INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  event TEXT NOT NULL,
  detail TEXT,
  ip TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS token_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_id TEXT NOT NULL,
  viewed_at TEXT NOT NULL,
  lang TEXT,
  agent TEXT,
  FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
  slug TEXT PRIMARY KEY,
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  stack_json TEXT NOT NULL DEFAULT '[]',
  images_json TEXT NOT NULL DEFAULT '[]',
  href TEXT,
  title_de TEXT NOT NULL,
  title_en TEXT NOT NULL,
  kicker_de TEXT NOT NULL DEFAULT '',
  kicker_en TEXT NOT NULL DEFAULT '',
  summary_de TEXT NOT NULL DEFAULT '',
  summary_en TEXT NOT NULL DEFAULT '',
  one_liner_de TEXT NOT NULL DEFAULT '',
  one_liner_en TEXT NOT NULL DEFAULT '',
  highlights_de_json TEXT NOT NULL DEFAULT '[]',
  highlights_en_json TEXT NOT NULL DEFAULT '[]',
  images_meta_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS experience (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT,
  stack_json TEXT NOT NULL DEFAULT '[]',
  project_links_json TEXT NOT NULL DEFAULT '[]',
  role_de TEXT NOT NULL,
  role_en TEXT NOT NULL,
  company_de TEXT NOT NULL,
  company_en TEXT NOT NULL,
  location_de TEXT NOT NULL DEFAULT '',
  location_en TEXT NOT NULL DEFAULT '',
  highlights_de_json TEXT NOT NULL DEFAULT '[]',
  highlights_en_json TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS content_strings (
  key TEXT NOT NULL,
  locale TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (key, locale)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL,
  locked_until INTEGER
);

CREATE INDEX IF NOT EXISTS idx_tokens_hash ON tokens(hash);
CREATE INDEX IF NOT EXISTS idx_token_views_token ON token_views(token_id);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_experience_sort ON experience(sort_order);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_category ON audit_logs(category);
`

export function getDb(): DatabaseSync {
  if (db) {
    if (!seeded) {
      ensureSeed(db)
    }
    return db
  }

  const dir = getDataDir()
  mkdirSync(dir, { recursive: true })
  mkdirSync(path.join(dir, 'uploads', 'projects'), { recursive: true })

  const filePath = path.join(dir, 'cv.sqlite')
  db = new DatabaseSync(filePath)
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA foreign_keys = ON;')
  db.exec(SCHEMA)
  migrateSchema(db)
  ensureSeed(db)
  return db
}

function migrateSchema(database: DatabaseSync) {
  const tokenCols = database
    .prepare("PRAGMA table_info('tokens')")
    .all() as Array<{ name: string }>
  if (!tokenCols.some((col) => col.name === 'sealed')) {
    database.exec('ALTER TABLE tokens ADD COLUMN sealed TEXT')
  }
}

function metaGet(database: DatabaseSync, key: string): string | null {
  const row = database
    .prepare('SELECT value FROM meta WHERE key = ?')
    .get(key) as { value: string } | undefined
  return row?.value ?? null
}

function metaSet(database: DatabaseSync, key: string, value: string) {
  database
    .prepare(
      'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    )
    .run(key, value)
}

function ensureSeed(database: DatabaseSync) {
  if (seeded) return
  seeded = true

  if (!metaGet(database, 'schema_version')) {
    metaSet(database, 'schema_version', '1')
  }

  migrateTokensJson(database)
  seedAdminIfNeeded(database)
  seedContentIfNeeded(database)
}

function migrateTokensJson(database: DatabaseSync) {
  const count = (
    database.prepare('SELECT COUNT(*) AS c FROM tokens').get() as { c: number }
  ).c
  if (count > 0) return

  const jsonPath = path.join(getDataDir(), 'tokens.json')
  if (!existsSync(jsonPath)) return

  try {
    const raw = JSON.parse(readFileSync(jsonPath, 'utf8')) as {
      tokens?: Array<{
        id: string
        label: string
        role?: string
        hash: string
        createdAt: string
        expiresAt: string | null
        revoked: boolean
      }>
    }
    const insert = database.prepare(
      `INSERT OR IGNORE INTO tokens (id, label, role, hash, created_at, expires_at, revoked, view_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    )
    for (const t of raw.tokens ?? []) {
      insert.run(
        t.id,
        t.label,
        t.role ?? null,
        t.hash,
        t.createdAt,
        t.expiresAt,
        t.revoked ? 1 : 0,
      )
    }
    logEvent({ evt: 'seed', message: 'Migrated tokens.json into SQLite' })
  } catch {
    logEvent({ evt: 'error', message: 'Failed to migrate tokens.json' })
  }
}

function seedAdminIfNeeded(database: DatabaseSync) {
  const count = (
    database.prepare('SELECT COUNT(*) AS c FROM admins').get() as { c: number }
  ).c
  if (count > 0) return

  const username = 'admin'
  const password = randomBytes(9).toString('base64url')
  const now = new Date().toISOString()
  const passwordHash = hashPassword(password)

  database
    .prepare(
      `INSERT INTO admins (username, password_hash, must_change_credentials, created_at, updated_at)
       VALUES (?, ?, 1, ?, ?)`,
    )
    .run(username, passwordHash, now, now)

  process.stdout.write(
    `${JSON.stringify({
      ts: now,
      evt: 'admin_bootstrap',
      message: 'Initial admin created — change credentials on first login',
      username,
      temporaryPassword: password,
    })}\n`,
  )
}

function seedContentIfNeeded(database: DatabaseSync) {
  if (metaGet(database, 'content_seeded') === '1') return

  const upsertString = database.prepare(
    `INSERT INTO content_strings (key, locale, value) VALUES (?, ?, ?)
     ON CONFLICT(key, locale) DO NOTHING`,
  )

  const flatDe = flattenStrings(de as unknown as Record<string, unknown>)
  const flatEn = flattenStrings(en as unknown as Record<string, unknown>)
  for (const [key, value] of Object.entries(flatDe)) {
    upsertString.run(key, 'de', value)
  }
  for (const [key, value] of Object.entries(flatEn)) {
    upsertString.run(key, 'en', value)
  }

  const projectCount = (
    database.prepare('SELECT COUNT(*) AS c FROM projects').get() as { c: number }
  ).c

  if (projectCount === 0) {
    const insertProject = database.prepare(
      `INSERT INTO projects (
        slug, featured, sort_order, stack_json, images_json, href,
        title_de, title_en, kicker_de, kicker_en, summary_de, summary_en,
        one_liner_de, one_liner_en, highlights_de_json, highlights_en_json, images_meta_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )

    const allSlugs = [
      ...shared.featuredProjectOrder,
      ...shared.compactProjectOrder,
    ]
    allSlugs.forEach((slug, index) => {
      const project = shared.projects[slug]
      const deFeat = de.projects.featured[slug as keyof typeof de.projects.featured]
      const enFeat = en.projects.featured[slug as keyof typeof en.projects.featured]
      const deComp = de.projects.compact[slug as keyof typeof de.projects.compact]
      const enComp = en.projects.compact[slug as keyof typeof en.projects.compact]

      if (project.featured && deFeat && enFeat) {
        insertProject.run(
          slug,
          1,
          index,
          JSON.stringify(project.stack),
          JSON.stringify(project.images),
          project.href ?? null,
          deFeat.title,
          enFeat.title,
          deFeat.kicker,
          enFeat.kicker,
          deFeat.summary,
          enFeat.summary,
          '',
          '',
          JSON.stringify(deFeat.highlights),
          JSON.stringify(enFeat.highlights),
          JSON.stringify({ de: deFeat.images, en: enFeat.images }),
        )
      } else if (deComp && enComp) {
        insertProject.run(
          slug,
          0,
          index,
          JSON.stringify(project.stack),
          JSON.stringify(project.images),
          project.href ?? null,
          deComp.title,
          enComp.title,
          deComp.kicker,
          enComp.kicker,
          '',
          '',
          deComp.oneLiner,
          enComp.oneLiner,
          JSON.stringify(deComp.highlights),
          JSON.stringify(enComp.highlights),
          JSON.stringify({ de: deComp.images, en: enComp.images }),
        )
      }
    })
  }

  const expCount = (
    database.prepare('SELECT COUNT(*) AS c FROM experience').get() as { c: number }
  ).c

  if (expCount === 0) {
    const insertExp = database.prepare(
      `INSERT INTO experience (
        id, sort_order, start_date, end_date, stack_json, project_links_json,
        role_de, role_en, company_de, company_en, location_de, location_en,
        highlights_de_json, highlights_en_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )

    shared.experiences.forEach((exp, index) => {
      const deEntry = de.experience.entries[exp.id]
      const enEntry = en.experience.entries[exp.id]
      insertExp.run(
        exp.id,
        index,
        exp.start,
        exp.end,
        JSON.stringify(exp.stack),
        JSON.stringify(exp.projectLinks ?? []),
        deEntry.role,
        enEntry.role,
        deEntry.company,
        enEntry.company,
        deEntry.location,
        enEntry.location,
        JSON.stringify(deEntry.highlights),
        JSON.stringify(enEntry.highlights),
      )
    })
  }

  metaSet(database, 'content_seeded', '1')
  logEvent({ evt: 'seed', message: 'Seeded CV content into SQLite' })
}

function flattenStrings(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const pathKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      out[pathKey] = value
    } else if (Array.isArray(value)) {
      if (value.every((v) => typeof v === 'string')) {
        out[pathKey] = JSON.stringify(value)
      } else if (
        value.every(
          (v) =>
            v &&
            typeof v === 'object' &&
            'name' in (v as object) &&
            'level' in (v as object),
        )
      ) {
        out[pathKey] = JSON.stringify(value)
      }
    } else if (value && typeof value === 'object') {
      Object.assign(out, flattenStrings(value as Record<string, unknown>, pathKey))
    }
  }
  return out
}

export function nowIso(): string {
  return new Date().toISOString()
}
