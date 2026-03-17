import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clack/prompts', () => ({
  note: vi.fn(),
  confirm: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}))

import * as p from '@clack/prompts'
import { promptSummary } from '../../src/prompts/summary'
import type { ProjectConfig } from '../../src/types'

const fullConfig: ProjectConfig = {
  name: 'my-app',
  outDir: './my-app',
  auth: 'clerk',
  database: 'postgres',
  payments: 'stripe',
  email: 'resend',
}

describe('promptSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(p.isCancel).mockReturnValue(false)
  })

  it('displays all 6 config fields in the note', async () => {
    vi.mocked(p.confirm).mockResolvedValueOnce(true as any)

    await promptSummary(fullConfig)

    expect(p.note).toHaveBeenCalledOnce()
    const [noteContent] = vi.mocked(p.note).mock.calls[0]
    expect(noteContent).toContain('my-app')
    expect(noteContent).toContain('./my-app')
    expect(noteContent).toContain('clerk')
    expect(noteContent).toContain('postgres')
    expect(noteContent).toContain('stripe')
    expect(noteContent).toContain('resend')
  })

  it('displays none for null payments and email', async () => {
    vi.mocked(p.confirm).mockResolvedValueOnce(true as any)

    const config: ProjectConfig = { ...fullConfig, payments: null, email: null }
    await promptSummary(config)

    const [noteContent] = vi.mocked(p.note).mock.calls[0]
    expect(noteContent).toContain('none')
  })

  it('resolves without exit when confirmed', async () => {
    vi.mocked(p.confirm).mockResolvedValueOnce(true as any)

    await expect(promptSummary(fullConfig)).resolves.toBeUndefined()
  })

  it('calls process.exit(0) when user selects no', async () => {
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code: number) => {
        throw new Error(`process.exit(${code})`)
      }) as any)

    vi.mocked(p.confirm).mockResolvedValueOnce(false as any)

    await expect(promptSummary(fullConfig)).rejects.toThrow('process.exit(0)')
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })

  it('calls process.exit(0) when cancelled', async () => {
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code: number) => {
        throw new Error(`process.exit(${code})`)
      }) as any)

    vi.mocked(p.isCancel).mockReturnValueOnce(true)
    vi.mocked(p.confirm).mockResolvedValueOnce(Symbol('cancel') as any)

    await expect(promptSummary(fullConfig)).rejects.toThrow('process.exit(0)')
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })
})
