import { mkdirSync, readdirSync, existsSync, statSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const rawRoot = path.join(root, 'assets', 'raw')
const publicRoot = path.join(root, 'public')
const sharedPath = path.join(root, 'src', 'content', 'shared.ts')

function loadManifest() {
  const text = readFileSync(sharedPath, 'utf8')
  const projects = {}
  const projectBlocks = [
    ...text.matchAll(/^\s{2}(?:'([^']+)'|(\w+)):\s*\{([\s\S]*?)^\s{2}\},?/gm),
  ]

  for (const match of projectBlocks) {
    const slug = match[1] || match[2]
    const body = match[3] || ''
    if (!body.includes('images:')) continue
    const imagesMatch = body.match(/images:\s*\[([\s\S]*?)\]/)
    if (!imagesMatch) continue
    const images = [...imagesMatch[1].matchAll(/'([^']+\.webp)'/g)].map((m) => m[1])
    projects[slug] = { images }
  }

  return projects
}

async function convertImage(inputPath, outputPath, maxWidth) {
  mkdirSync(path.dirname(outputPath), { recursive: true })
  await sharp(inputPath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(outputPath)
  console.log(`Wrote ${path.relative(root, outputPath)}`)
}

function listFilesRecursive(dir) {
  if (!existsSync(dir)) return []
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(full))
    } else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

const projects = loadManifest()
const expected = new Set()

for (const [slug, project] of Object.entries(projects)) {
  for (const image of project.images || []) {
    expected.add(path.join('projects', slug, image))
  }
}

const rawFiles = listFilesRecursive(rawRoot)
for (const input of rawFiles) {
  const rel = path.relative(rawRoot, input)
  if (/^portrait\.(jpe?g|png|webp)$/i.test(rel)) {
    await convertImage(input, path.join(publicRoot, 'portrait.webp'), 1200)
    continue
  }

  const parts = rel.split(path.sep)
  if (parts.length < 2) continue
  const slug = parts[0]
  const base = path.parse(parts.slice(1).join('/')).name
  const outRel = path.join('projects', slug, `${base}.webp`)
  await convertImage(input, path.join(publicRoot, outRel), 2400)
}

const generated = new Set()
const projectsDir = path.join(publicRoot, 'projects')
if (existsSync(projectsDir)) {
  for (const slug of readdirSync(projectsDir)) {
    const dir = path.join(projectsDir, slug)
    if (!statSync(dir).isDirectory()) continue
    for (const file of readdirSync(dir)) {
      if (file.endsWith('.webp')) {
        generated.add(path.join('projects', slug, file))
      }
    }
  }
}
if (existsSync(path.join(publicRoot, 'portrait.webp'))) {
  generated.add('portrait.webp')
}

const missing = [...expected].filter((f) => !generated.has(f))
const extra = [...generated].filter((f) => !expected.has(f) && f !== 'portrait.webp')

if (missing.length) {
  console.log('Missing (expected by manifest):')
  for (const f of missing) console.log(`  - ${f}`)
}
if (extra.length) {
  console.log('Extra (not in manifest):')
  for (const f of extra) console.log(`  - ${f}`)
}
if (!rawFiles.length) {
  console.log('No raw assets in assets/raw. Placeholders will be used at runtime.')
}
