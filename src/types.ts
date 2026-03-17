import { z } from 'zod'

export type AuthProvider = 'clerk' | 'nextauth' | 'supabase'
export type DatabaseProvider = 'postgres' | 'sqlite' | 'supabase'
export type PaymentsProvider = 'stripe' | 'lemonsqueezy'
export type EmailProvider = 'resend' | 'postmark'

export type ProjectConfig = {
  name: string
  outDir: string
  auth: AuthProvider
  database: DatabaseProvider
  payments: PaymentsProvider | null
  email: EmailProvider | null
}

export const projectConfigSchema = z.object({
  name: z.string().min(1),
  outDir: z.string().min(1),
  auth: z.enum(['clerk', 'nextauth', 'supabase']),
  database: z.enum(['postgres', 'sqlite', 'supabase']),
  payments: z.enum(['stripe', 'lemonsqueezy']).nullable(),
  email: z.enum(['resend', 'postmark']).nullable(),
})
