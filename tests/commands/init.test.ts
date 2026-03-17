import { describe, it, expect, vi, beforeEach } from 'vitest'
import path from 'path'
import os from 'os'
import fs from 'fs-extra'

// Mock prompts
vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
  confirm: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn(() => false),
  log: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}))

// Mock prompt modules
vi.mock('../../src/prompts/project.js', () => ({ promptProject: vi.fn() }))
vi.mock('../../src/prompts/auth.js', () => ({ promptAuth: vi.fn() }))
vi.mock('../../src/prompts/database.js', () => ({ promptDatabase: vi.fn() }))
vi.mock('../../src/prompts/payments.js', () => ({ promptPayments: vi.fn() }))
vi.mock('../../src/prompts/email.js', () => ({ promptEmail: vi.fn() }))
vi.mock('../../src/prompts/summary.js', () => ({ promptSummary: vi.fn() }))

// Mock generator orchestrator
vi.mock('../../src/generators/index.js', () => ({ generate: vi.fn() }))

// Mock child_process
vi.mock('child_process', () => ({ execSync: vi.fn() }))

import * as clack from '@clack/prompts'
import { promptProject } from '../../src/prompts/project.js'
import { promptAuth } from '../../src/prompts/auth.js'
import { promptDatabase } from '../../src/prompts/database.js'
import { promptPayments } from '../../src/prompts/payments.js'
import { promptEmail } from '../../src/prompts/email.js'
import { promptSummary } from '../../src/prompts/summary.js'
import { generate } from '../../src/generators/index.js'
import { execSync } from 'child_process'
import { initCommand } from '../../src/commands/init.js'

describe('initCommand', () => {
  let outDir: string

  beforeEach(async () => {
    outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-cmd-'))
    vi.clearAllMocks()

    // Default mock implementations
    ;(promptProject as ReturnType<typeof vi.fn>).mockResolvedValue({ name: 'my-app', outDir })
    ;(promptAuth as ReturnType<typeof vi.fn>).mockResolvedValue({ auth: 'clerk' })
    ;(promptDatabase as ReturnType<typeof vi.fn>).mockResolvedValue({ database: 'postgres' })
    ;(promptPayments as ReturnType<typeof vi.fn>).mockResolvedValue({ payments: null })
    ;(promptEmail as ReturnType<typeof vi.fn>).mockResolvedValue({ email: null })
    ;(promptSummary as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(generate as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(clack.confirm as ReturnType<typeof vi.fn>).mockResolvedValue(false)
    ;(clack.isCancel as ReturnType<typeof vi.fn>).mockReturnValue(false)
  })

  it('calls all prompts in sequence', async () => {
    const callOrder: string[] = []
    ;(promptProject as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      callOrder.push('project')
      return { name: 'my-app', outDir }
    })
    ;(promptAuth as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      callOrder.push('auth')
      return { auth: 'clerk' }
    })
    ;(promptDatabase as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      callOrder.push('database')
      return { database: 'postgres' }
    })
    ;(promptPayments as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      callOrder.push('payments')
      return { payments: null }
    })
    ;(promptEmail as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      callOrder.push('email')
      return { email: null }
    })
    ;(promptSummary as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      callOrder.push('summary')
    })

    await initCommand()

    expect(callOrder).toEqual(['project', 'auth', 'database', 'payments', 'email', 'summary'])
  })

  it('calls generate with assembled ProjectConfig', async () => {
    await initCommand()

    expect(generate).toHaveBeenCalledWith({
      name: 'my-app',
      outDir,
      auth: 'clerk',
      database: 'postgres',
      payments: null,
      email: null,
    })
  })

  it('does not run pnpm install when user declines', async () => {
    ;(clack.confirm as ReturnType<typeof vi.fn>).mockResolvedValue(false)

    await initCommand()

    expect(execSync).not.toHaveBeenCalled()
  })

  it('runs pnpm install in outDir when user confirms', async () => {
    ;(clack.confirm as ReturnType<typeof vi.fn>).mockResolvedValue(true)

    await initCommand()

    expect(execSync).toHaveBeenCalledWith('pnpm install', { cwd: outDir, stdio: 'ignore' })
  })

  it('does not run install when confirm is cancelled', async () => {
    ;(clack.confirm as ReturnType<typeof vi.fn>).mockResolvedValue(Symbol('cancel'))
    ;(clack.isCancel as ReturnType<typeof vi.fn>).mockReturnValue(true)

    await initCommand()

    expect(execSync).not.toHaveBeenCalled()
  })

  it('aborts before generating when Zod validation fails', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code) => {
      throw new Error('process.exit called')
    })

    // Return invalid auth value to fail Zod validation
    ;(promptAuth as ReturnType<typeof vi.fn>).mockResolvedValue({ auth: 'invalid-auth' })

    await expect(initCommand()).rejects.toThrow('process.exit called')

    expect(generate).not.toHaveBeenCalled()
    exitSpy.mockRestore()
  })

  it('handles pnpm install failure gracefully and shows warning', async () => {
    ;(clack.confirm as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    ;(execSync as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('pnpm not found')
    })

    // Should not throw — the catch block handles the error
    await expect(initCommand()).resolves.toBeUndefined()
    expect(clack.log.warn).toHaveBeenCalledWith('Run `pnpm install` manually to install dependencies')
  })

  it('passes full config with payments and email to generate', async () => {
    ;(promptPayments as ReturnType<typeof vi.fn>).mockResolvedValue({ payments: 'stripe' })
    ;(promptEmail as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'resend' })

    await initCommand()

    expect(generate).toHaveBeenCalledWith({
      name: 'my-app',
      outDir,
      auth: 'clerk',
      database: 'postgres',
      payments: 'stripe',
      email: 'resend',
    })
  })
})
