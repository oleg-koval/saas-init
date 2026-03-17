import * as p from '@clack/prompts'
import type { AuthProvider } from '../types.js'

export type AuthAnswers = {
  auth: AuthProvider
}

export async function promptAuth(): Promise<AuthAnswers> {
  const auth = await p.select<AuthProvider>({
    message: 'Auth provider',
    options: [
      { value: 'clerk', label: 'Clerk' },
      { value: 'nextauth', label: 'NextAuth' },
      { value: 'supabase', label: 'Supabase Auth' },
    ],
  })

  if (p.isCancel(auth)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  return { auth: auth as AuthProvider }
}
