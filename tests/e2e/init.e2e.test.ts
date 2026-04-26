/**
 * E2E tests for saas-init CLI — init command
 *
 * Strategy: mock ONLY the terminal I/O layer (@clack/prompts) and
 * child_process (pnpm install). All generators, config validation,
 * template substitution, and file writes run against real disk I/O
 * in an isolated temp directory.
 *
 * This is distinct from:
 *   - tests/commands/init.test.ts  (mocks generators, tests orchestration only)
 *   - tests/generators/*.test.ts   (calls generate() directly, skips CLI layer)
 *
 * These tests validate the full vertical slice:
 *   prompt answers → initCommand → config validation → generators → files on disk
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'

// ── Mock terminal I/O only ──────────────────────────────────────────────────

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
  confirm: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn(() => false),
  log: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
    step: vi.fn(),
  },
  select: vi.fn(),
  text: vi.fn(),
}))

vi.mock('child_process', () => ({ execSync: vi.fn() }))

// ── Imports after mocks ─────────────────────────────────────────────────────

import * as p from '@clack/prompts'
import { initCommand } from '../../src/commands/init.js'

// ── Helpers ─────────────────────────────────────────────────────────────────

type PromptConfig = {
  name?: string
  nextVersion?: '15' | '16'
  auth?: 'clerk' | 'nextauth' | 'supabase'
  database?: 'postgres' | 'sqlite' | 'supabase'
  payments?: 'stripe' | 'lemonsqueezy' | null
  email?: 'resend' | 'postmark' | null
}

/**
 * Wire up @clack/prompts mocks to simulate user answering every prompt
 * in the order initCommand drives them.
 *
 * text call order:
 *   1. project name
 *   2. output dir
 *   3+ env vars (depends on providers)
 *
 * select call order:
 *   1. nextVersion
 *   2. auth
 *   3. database
 *   4. payments
 *   5. email
 *
 * confirm call order:
 *   1. "Generate project?" (summary)
 *   2. "Install dependencies now?"
 */
function wirePrompts(outDir: string, cfg: PromptConfig): void {
  const name = cfg.name ?? 'e2e-test-app'
  const nextVersion = cfg.nextVersion ?? '16'
  const auth = cfg.auth ?? 'clerk'
  const database = cfg.database ?? 'postgres'
  const payments = cfg.payments ?? null
  const email = cfg.email ?? null

  // Build env-var text answers in the same order promptEnvVars collects them
  const envTextAnswers: string[] = []

  if (auth === 'supabase') {
    envTextAnswers.push('https://test.supabase.co', 'anon-key', 'service-key')
  } else if (auth === 'clerk') {
    envTextAnswers.push('pk_test_xxx', 'sk_test_xxx')
  }
  // nextauth generates AUTH_SECRET automatically — no text prompt

  if (database === 'postgres') {
    envTextAnswers.push('postgresql://user:pass@localhost:5432/db')
  } else if (database === 'supabase' && auth !== 'supabase') {
    envTextAnswers.push('https://test.supabase.co', 'anon-key', 'service-key')
  }

  if (payments === 'stripe') {
    envTextAnswers.push('sk_test_stripe', 'whsec_test')
  } else if (payments === 'lemonsqueezy') {
    envTextAnswers.push('ls_api_key', '')
  }

  if (email === 'resend') {
    envTextAnswers.push('re_api_key')
  } else if (email === 'postmark') {
    envTextAnswers.push('pm_token')
  }

  // Wire text: name, outDir, then env vars
  const textMock = vi.mocked(p.text)
  textMock.mockResolvedValueOnce(name as any)
  textMock.mockResolvedValueOnce(outDir as any)
  for (const answer of envTextAnswers) {
    textMock.mockResolvedValueOnce(answer as any)
  }

  // Wire select: nextVersion, auth, database, payments, email
  vi.mocked(p.select)
    .mockResolvedValueOnce(nextVersion as any)
    .mockResolvedValueOnce(auth as any)
    .mockResolvedValueOnce(database as any)
    .mockResolvedValueOnce(payments as any)
    .mockResolvedValueOnce(email as any)

  // Wire confirm: confirm generation = true, install deps = false
  vi.mocked(p.confirm)
    .mockResolvedValueOnce(true as any)
    .mockResolvedValueOnce(false as any)
}

// ── Fixtures ────────────────────────────────────────────────────────────────

let tmpDir: string

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-e2e-'))
  vi.clearAllMocks()
  vi.mocked(p.isCancel).mockReturnValue(false)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

// ── Tests ───────────────────────────────────────────────────────────────────

describe('E2E: Next.js version selection', () => {
  it('generates package.json with next ^16.2.0 when version 16 selected', async () => {
    wirePrompts(tmpDir, { nextVersion: '16' })
    await initCommand()

    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies.next).toBe('^16.2.0')
  })

  it('generates package.json with next ^15.3.0 when version 15 selected', async () => {
    wirePrompts(tmpDir, { nextVersion: '15' })
    await initCommand()

    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies.next).toBe('^15.3.0')
  })

  it('generated package.json name matches project name', async () => {
    wirePrompts(tmpDir, { name: 'my-cool-saas', nextVersion: '16' })
    await initCommand()

    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.name).toBe('my-cool-saas')
  })
})

describe('E2E: full file generation — Next.js 16 + Clerk + Postgres', () => {
  beforeEach(() => {
    wirePrompts(tmpDir, {
      nextVersion: '16',
      auth: 'clerk',
      database: 'postgres',
      payments: null,
      email: null,
    })
  })

  it('creates all required base files', async () => {
    await initCommand()

    const expectedFiles = [
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css',
      'next.config.ts',
      'tsconfig.json',
      'package.json',
      '.gitignore',
    ]
    for (const file of expectedFiles) {
      expect(await fs.pathExists(path.join(tmpDir, file)), `missing: ${file}`).toBe(true)
    }
  })

  it('creates Clerk auth files', async () => {
    await initCommand()

    expect(await fs.pathExists(path.join(tmpDir, 'middleware.ts'))).toBe(true)
    expect(
      await fs.pathExists(path.join(tmpDir, 'app/sign-in/[[...sign-in]]/page.tsx')),
    ).toBe(true)
  })

  it('creates Drizzle database files for postgres', async () => {
    await initCommand()

    expect(await fs.pathExists(path.join(tmpDir, 'drizzle.config.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(tmpDir, 'db/schema.ts'))).toBe(true)
  })

  it('writes .env.local with Clerk and Postgres vars', async () => {
    await initCommand()

    const env = await fs.readFile(path.join(tmpDir, '.env.local'), 'utf-8')
    expect(env).toContain('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx')
    expect(env).toContain('CLERK_SECRET_KEY=sk_test_xxx')
    expect(env).toContain('DATABASE_URL=postgresql://user:pass@localhost:5432/db')
  })

  it('package.json has next ^16.2.0, tailwindcss, clsx', async () => {
    await initCommand()

    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies.next).toBe('^16.2.0')
    expect(pkg.devDependencies).toHaveProperty('tailwindcss')
    expect(pkg.dependencies).toHaveProperty('clsx')
  })
})

describe('E2E: full file generation — Next.js 15 + NextAuth + SQLite', () => {
  beforeEach(() => {
    wirePrompts(tmpDir, {
      nextVersion: '15',
      auth: 'nextauth',
      database: 'sqlite',
      payments: null,
      email: null,
    })
  })

  it('generates next ^15.3.0 in package.json', async () => {
    await initCommand()

    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies.next).toBe('^15.3.0')
  })

  it('creates NextAuth files', async () => {
    await initCommand()

    expect(await fs.pathExists(path.join(tmpDir, 'app/api/auth/[...nextauth]/route.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(tmpDir, 'auth.ts'))).toBe(true)
  })

  it('creates SQLite Drizzle config', async () => {
    await initCommand()

    const drizzleConfig = await fs.readFile(path.join(tmpDir, 'drizzle.config.ts'), 'utf-8')
    expect(drizzleConfig).toContain('sqlite')
  })

  it('writes .env.local with AUTH_SECRET for NextAuth', async () => {
    await initCommand()

    const env = await fs.readFile(path.join(tmpDir, '.env.local'), 'utf-8')
    expect(env).toContain('AUTH_SECRET=')
    expect(env).toContain('AUTH_URL=http://localhost:3000')
  })
})

describe('E2E: full stack — Next.js 16 + Clerk + Postgres + Stripe + Resend', () => {
  beforeEach(() => {
    wirePrompts(tmpDir, {
      nextVersion: '16',
      auth: 'clerk',
      database: 'postgres',
      payments: 'stripe',
      email: 'resend',
    })
  })

  it('generates all provider files without throwing', async () => {
    await expect(initCommand()).resolves.toBeUndefined()
  })

  it('includes Stripe env vars in .env.local', async () => {
    await initCommand()

    const env = await fs.readFile(path.join(tmpDir, '.env.local'), 'utf-8')
    expect(env).toContain('STRIPE_SECRET_KEY=sk_test_stripe')
    expect(env).toContain('RESEND_API_KEY=re_api_key')
  })

  it('creates Stripe payment files', async () => {
    await initCommand()

    expect(await fs.pathExists(path.join(tmpDir, 'app/api/webhooks/stripe/route.ts'))).toBe(true)
  })
})
