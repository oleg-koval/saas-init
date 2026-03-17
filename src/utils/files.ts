import fs from 'fs-extra'
import path from 'path'
import { replaceVars } from './template.js'

export async function writeTemplate(
  templatePath: string,
  destPath: string,
  vars: Record<string, string>
): Promise<void> {
  const content = await fs.readFile(templatePath, 'utf-8')
  const substituted = replaceVars(content, vars)
  await fs.ensureDir(path.dirname(destPath))
  await fs.writeFile(destPath, substituted, 'utf-8')
}


export async function copyDir(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest)
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath)
}

export async function appendEnv(
  destPath: string,
  vars: Record<string, string>
): Promise<void> {
  const envFile = path.join(destPath, '.env.example')

  let existing = ''
  if (await fs.pathExists(envFile)) {
    existing = await fs.readFile(envFile, 'utf-8')
  }

  const existingKeys = new Set(
    existing
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('#') && line.includes('='))
      .map((line) => line.substring(0, line.indexOf('=')).trim())
      .filter(Boolean)
  )

  const newLines = Object.entries(vars)
    .filter(([key]) => !existingKeys.has(key))
    .map(([key, value]) => `${key}=${value}`)

  if (newLines.length === 0) return

  const toAppend = existing.endsWith('\n') || existing === ''
    ? newLines.join('\n') + '\n'
    : '\n' + newLines.join('\n') + '\n'

  await fs.appendFile(envFile, toAppend, 'utf-8')
}
