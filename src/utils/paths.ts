import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'

function findTemplatesRoot(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url))
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, 'templates')
    if (existsSync(candidate)) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  throw new Error('Could not find templates directory')
}

export const TEMPLATES_ROOT = findTemplatesRoot()
