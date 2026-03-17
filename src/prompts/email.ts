import * as p from '@clack/prompts'
import type { EmailProvider } from '../types.js'

export type EmailAnswers = {
  email: EmailProvider | null
}

type EmailOption = EmailProvider | 'none'

export async function promptEmail(): Promise<EmailAnswers> {
  const email = await p.select<EmailOption>({
    message: 'Email provider',
    options: [
      { value: 'resend', label: 'Resend' },
      { value: 'postmark', label: 'Postmark' },
      { value: 'none', label: 'Skip' },
    ],
  })

  if (p.isCancel(email)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  return { email: email === 'none' ? null : (email as EmailProvider) }
}
