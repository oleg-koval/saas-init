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
    problem1Title: 'Wasted time on setup',
    problem1Body:
      'Every new project means hours of boilerplate before you can build the actual thing.',
    problem2Title: 'Inconsistent foundations',
    problem2Body: 'Without a standard stack, every project diverges and maintenance gets harder.',
    problem3Title: 'Slow time to first user',
    problem3Body: 'The longer it takes to go live, the longer you wait for real feedback.',
    testimonial1Quote:
      'This saved us weeks of setup time. We shipped our first paying customer in under 48 hours.',
    testimonial1Name: 'Alex Johnson',
    testimonial1Role: 'Founder, Acme Corp',
    testimonial2Quote:
      'The best investment I made this year. Auth, payments, and emails all working out of the box.',
    testimonial2Name: 'Sarah Chen',
    testimonial2Role: 'CTO, Startup Inc',
    testimonial3Quote:
      'I have tried every boilerplate out there. This one actually ships production-ready code.',
    testimonial3Name: 'Marcus Williams',
    testimonial3Role: 'Indie Hacker',
    stage1Body:
      'You get your first win immediately. Setup takes minutes, results come the same day.',
    stage2Body: 'Each day builds on the last. Your results compound and momentum grows steadily.',
    stage3Body:
      'You now have a clear competitive advantage. The gap between you and others widens.',
    stage4Body:
      'You are operating at 10x your previous capacity. Results that used to take months happen in days.',
  }

  const componentFiles = [
    'components/Hero.tsx',
    'components/ProblemAgitate.tsx',
    'components/ValueStack.tsx',
    'components/SocialProof.tsx',
    'components/Transformation.tsx',
    'components/SecondaryCTA.tsx',
    'components/Footer.tsx',
  ]

  await Promise.all(
    componentFiles.map((file) =>
      writeTemplate(path.join(TEMPLATES_DIR, file), path.join(outDir, file), vars)
    )
  )

  // Write page.tsx last — intentionally overwrites base generator's version
  await writeTemplate(
    path.join(TEMPLATES_DIR, 'app/page.tsx'),
    path.join(outDir, 'app/page.tsx'),
    vars
  )
}
