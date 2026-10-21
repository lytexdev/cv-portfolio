import 'server-only'
import path from 'node:path'

export function getDataDir(): string {
  if (process.env.CV_DATA_DIR) {
    return process.env.CV_DATA_DIR
  }
  return path.resolve(process.cwd(), 'data')
}
