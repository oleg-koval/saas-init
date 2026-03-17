import path from 'path'
import * as p from '@clack/prompts'

export type ProjectAnswers = {
  name: string
  outDir: string
}

function isValidNpmName(value: string): true | string {
  if (!value) return 'Project name is required'
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)) {
    return 'Name must be lowercase, start and end with a letter or digit, and contain only letters, digits, and hyphens'
  }
  return true
}

export async function promptProject(): Promise<ProjectAnswers> {
  const name = await p.text({
    message: 'Project name',
    placeholder: 'my-app',
    validate: (value) => {
      const result = isValidNpmName(value)
      if (result !== true) return result
    },
  })

  if (p.isCancel(name)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  const outDir = await p.text({
    message: 'Output directory',
    placeholder: `./${name}`,
    defaultValue: `./${name}`,
    validate: (value) => {
      const resolved = path.resolve(value || `./${name}`)
      const cwd = path.resolve(process.cwd())
      if (!resolved.startsWith(cwd + path.sep) && resolved !== cwd) {
        return 'Output directory must be inside the current working directory'
      }
    },
  })

  if (p.isCancel(outDir)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  return { name: name as string, outDir: path.resolve((outDir as string) || `./${name as string}`) }
}
