import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src', 'fonts')

const files = [
  {
    from: join(
      root,
      'node_modules',
      '@fontsource-variable',
      'montserrat',
      'files',
      'montserrat-latin-wght-normal.woff2',
    ),
    to: join(outDir, 'montserrat-latin-wght-normal.woff2'),
  },
  {
    from: join(root, 'node_modules', '@fontsource-variable', 'montserrat', 'LICENSE'),
    to: join(outDir, 'OFL-montserrat.txt'),
  },
  {
    from: join(
      root,
      'node_modules',
      '@fontsource-variable',
      'jetbrains-mono',
      'files',
      'jetbrains-mono-latin-wght-normal.woff2',
    ),
    to: join(outDir, 'jetbrains-mono-latin-wght-normal.woff2'),
  },
  {
    from: join(root, 'node_modules', '@fontsource-variable', 'jetbrains-mono', 'LICENSE'),
    to: join(outDir, 'OFL-jetbrains-mono.txt'),
  },
]

mkdirSync(outDir, { recursive: true })

for (const file of files) {
  if (!existsSync(file.from)) {
    console.error(`Missing source: ${file.from}`)
    process.exit(1)
  }
  copyFileSync(file.from, file.to)
  console.log(`Copied ${file.to}`)
}
