import { describe, it, expect, vi, beforeEach } from 'vitest'
import path from 'path'

// Mock @clack/prompts before importing the module under test
vi.mock('@clack/prompts', () => ({
  text: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}))

import * as p from '@clack/prompts'
import { promptProject } from '../../src/prompts/project'

describe('promptProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(p.isCancel).mockReturnValue(false)
  })

  it('returns name and outDir for valid input', async () => {
    vi.mocked(p.text).mockResolvedValueOnce('my-app').mockResolvedValueOnce('./my-app')

    const result = await promptProject()
    expect(result).toEqual({ name: 'my-app', outDir: path.resolve('./my-app') })
  })

  it('defaults outDir to ./<name>', async () => {
    vi.mocked(p.text).mockResolvedValueOnce('cool-project').mockResolvedValueOnce('./cool-project')

    const result = await promptProject()
    expect(result.outDir).toBe(path.resolve('./cool-project'))
  })

  it('rejects name with spaces via validate', async () => {
    let capturedValidate: ((_v: string) => string | undefined) | undefined

    vi.mocked(p.text).mockImplementationOnce((opts: any) => {
      capturedValidate = opts.validate
      return Promise.resolve('valid-name')
    })
    vi.mocked(p.text).mockResolvedValueOnce('./valid-name')

    await promptProject()

    expect(capturedValidate).toBeDefined()
    expect(capturedValidate!('My App')).toBeTruthy()
  })

  it('rejects name with underscores via validate', async () => {
    let capturedValidate: ((_v: string) => string | undefined) | undefined

    vi.mocked(p.text).mockImplementationOnce((opts: any) => {
      capturedValidate = opts.validate
      return Promise.resolve('valid-name')
    })
    vi.mocked(p.text).mockResolvedValueOnce('./valid-name')

    await promptProject()

    expect(capturedValidate!('my_app')).toBeTruthy()
  })

  it('rejects empty name via validate', async () => {
    let capturedValidate: ((_v: string) => string | undefined) | undefined

    vi.mocked(p.text).mockImplementationOnce((opts: any) => {
      capturedValidate = opts.validate
      return Promise.resolve('valid-name')
    })
    vi.mocked(p.text).mockResolvedValueOnce('./valid-name')

    await promptProject()

    expect(capturedValidate!('')).toBeTruthy()
  })

  it('accepts valid lowercase-hyphen names via validate', async () => {
    let capturedValidate: ((_v: string) => string | undefined) | undefined

    vi.mocked(p.text).mockImplementationOnce((opts: any) => {
      capturedValidate = opts.validate
      return Promise.resolve('valid-name')
    })
    vi.mocked(p.text).mockResolvedValueOnce('./valid-name')

    await promptProject()

    expect(capturedValidate!('my-app')).toBeUndefined()
    expect(capturedValidate!('myapp123')).toBeUndefined()
    expect(capturedValidate!('a')).toBeUndefined()
  })

  it('rejects name with trailing hyphen via validate', async () => {
    let capturedValidate: ((_v: string) => string | undefined) | undefined

    vi.mocked(p.text).mockImplementationOnce((opts: any) => {
      capturedValidate = opts.validate
      return Promise.resolve('valid-name')
    })
    vi.mocked(p.text).mockResolvedValueOnce('./valid-name')

    await promptProject()

    expect(capturedValidate!('my-app-')).toBeTruthy()
  })

  it('rejects outDir with parent traversal via validate', async () => {
    let capturedValidate: ((_v: string) => string | undefined) | undefined

    vi.mocked(p.text).mockResolvedValueOnce('my-app')
    vi.mocked(p.text).mockImplementationOnce((opts: any) => {
      capturedValidate = opts.validate
      return Promise.resolve('./my-app')
    })

    await promptProject()

    expect(capturedValidate).toBeDefined()
    expect(capturedValidate!('../dangerous')).toBeTruthy()
    expect(capturedValidate!('../../etc/passwd')).toBeTruthy()
  })

  it('accepts valid relative outDir via validate', async () => {
    let capturedValidate: ((_v: string) => string | undefined) | undefined

    vi.mocked(p.text).mockResolvedValueOnce('my-app')
    vi.mocked(p.text).mockImplementationOnce((opts: any) => {
      capturedValidate = opts.validate
      return Promise.resolve('./my-app')
    })

    await promptProject()

    expect(capturedValidate).toBeDefined()
    expect(capturedValidate!('./my-app')).toBeUndefined()
    expect(capturedValidate!('my-app')).toBeUndefined()
  })

  it('calls process.exit(0) when name prompt is cancelled', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code: number) => {
      throw new Error(`process.exit(${code})`)
    }) as any)

    vi.mocked(p.isCancel).mockReturnValueOnce(true)
    vi.mocked(p.text).mockResolvedValueOnce(Symbol('cancel') as any)

    await expect(promptProject()).rejects.toThrow('process.exit(0)')
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })

  it('calls process.exit(0) when outDir prompt is cancelled', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code: number) => {
      throw new Error(`process.exit(${code})`)
    }) as any)

    vi.mocked(p.isCancel).mockReturnValueOnce(false).mockReturnValueOnce(true)

    vi.mocked(p.text)
      .mockResolvedValueOnce('my-app')
      .mockResolvedValueOnce(Symbol('cancel') as any)

    await expect(promptProject()).rejects.toThrow('process.exit(0)')
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })
})
