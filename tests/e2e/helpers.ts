import { vi } from 'vitest'
import * as p from '@clack/prompts'

export type PromptConfig = {
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
 * text call order:  1. project name  2. output dir  3+ env vars
 * select call order: nextVersion → auth → database → payments → email
 * confirm call order: "Generate project?" → "Install dependencies now?"
 */
export function wirePrompts(outDir: string, cfg: PromptConfig): void {
  const name = cfg.name ?? 'e2e-test-app'
  const nextVersion = cfg.nextVersion ?? '16'
  const auth = cfg.auth ?? 'clerk'
  const database = cfg.database ?? 'postgres'
  const payments = cfg.payments ?? null
  const email = cfg.email ?? null

  const envTextAnswers: string[] = []

  if (auth === 'supabase') {
    envTextAnswers.push('https://test.supabase.co', 'anon-key', 'service-key')
  } else if (auth === 'clerk') {
    envTextAnswers.push('pk_test_xxx', 'sk_test_xxx')
  }

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

  const textMock = vi.mocked(p.text)
  textMock.mockResolvedValueOnce(name as any)
  textMock.mockResolvedValueOnce(outDir as any)
  for (const answer of envTextAnswers) {
    textMock.mockResolvedValueOnce(answer as any)
  }

  vi.mocked(p.select)
    .mockResolvedValueOnce(nextVersion as any)
    .mockResolvedValueOnce(auth as any)
    .mockResolvedValueOnce(database as any)
    .mockResolvedValueOnce(payments as any)
    .mockResolvedValueOnce(email as any)

  vi.mocked(p.confirm)
    .mockResolvedValueOnce(true as any)
    .mockResolvedValueOnce(false as any)
}
