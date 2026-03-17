import path from 'path'
import { writeTemplate } from '../utils/files.js'
import { TEMPLATES_ROOT } from '../utils/paths.js'
import type { ProjectConfig } from '../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'landing')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const vars = {
    name: config.name,
    tagline: 'Your tagline here',
    problemStatement: 'The core problem you solve',
    feature1: 'Feature one',
    feature2: 'Feature two',
    feature3: 'Feature three',
    price: '99',
  }

  const componentFiles: [string, string][] = [
    ['components/Hero.tsx', 'components/Hero.tsx'],
    ['components/ProblemAgitate.tsx', 'components/ProblemAgitate.tsx'],
    ['components/ValueStack.tsx', 'components/ValueStack.tsx'],
    ['components/SocialProof.tsx', 'components/SocialProof.tsx'],
    ['components/Transformation.tsx', 'components/Transformation.tsx'],
    ['components/SecondaryCTA.tsx', 'components/SecondaryCTA.tsx'],
    ['components/Footer.tsx', 'components/Footer.tsx'],
  ]

  await Promise.all(
    componentFiles.map(([templateFile, destFile]) =>
      writeTemplate(
        path.join(TEMPLATES_DIR, templateFile),
        path.join(outDir, destFile),
        vars
      )
    )
  )

  // Write page.tsx last — intentionally overwrites base generator's version
  await writeTemplate(
    path.join(TEMPLATES_DIR, 'app/page.tsx'),
    path.join(outDir, 'app/page.tsx'),
    vars
  )
}
