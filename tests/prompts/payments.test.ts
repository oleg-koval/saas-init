import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}))

import * as p from '@clack/prompts'
import { promptPayments } from '../../src/prompts/payments'

describe('promptPayments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(p.isCancel).mockReturnValue(false)
  })

  it('returns stripe for Stripe selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('stripe' as any)
    const result = await promptPayments()
    expect(result).toEqual({ payments: 'stripe' })
  })

  it('returns lemonsqueezy for Lemon Squeezy selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('lemonsqueezy' as any)
    const result = await promptPayments()
    expect(result).toEqual({ payments: 'lemonsqueezy' })
  })

  it('returns null for Skip selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('none' as any)
    const result = await promptPayments()
    expect(result).toEqual({ payments: null })
  })

  it('calls process.exit(0) when cancelled', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code: number) => {
      throw new Error(`process.exit(${code})`)
    }) as any)

    vi.mocked(p.isCancel).mockReturnValueOnce(true)
    vi.mocked(p.select).mockResolvedValueOnce(Symbol('cancel') as any)

    await expect(promptPayments()).rejects.toThrow('process.exit(0)')
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })
})
