import fs from 'fs-extra'
import path from 'path'
import { replaceVars } from './template.js'

export async function writeTemplate(
  templatePath: string,
  destPath: string,
  vars: Record<string, string>
): Promise<void> {
  try {
    const content = await fs.readFile(templatePath, 'utf-8')
    const substituted = replaceVars(content, vars)
    await fs.ensureDir(path.dirname(destPath))
    await fs.writeFile(destPath, substituted, 'utf-8')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to write template from ${templatePath} to ${destPath}: ${message}`)
  }
}

export async function writeEnvLocal(
  destPath: string,
  vars: Record<string, string>
): Promise<void> {
  const envFile = path.join(destPath, '.env.local')
  const lines = Object.entries(vars).map(([key, value]) => `${key}=${value}`)
  await fs.ensureDir(destPath)
  await fs.writeFile(envFile, lines.join('\n') + '\n', 'utf-8')
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
