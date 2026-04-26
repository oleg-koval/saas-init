import * as p from '@clack/prompts'
import type { NextVersion } from '../types.js'

export type NextVersionAnswers = {
  nextVersion: NextVersion
}

export async function promptNextVersion(): Promise<NextVersionAnswers> {
  const nextVersion = await p.select<NextVersion>({
    message: 'Next.js version',
    options: [
      { value: '16', label: 'Next.js 16 (latest)', hint: 'React 19, Turbopack stable' },
      { value: '15', label: 'Next.js 15', hint: 'React 18/19, stable' },
    ],
  })

  if (p.isCancel(nextVersion)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  return { nextVersion: nextVersion as NextVersion }
}
