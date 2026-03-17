import * as p from '@clack/prompts'
import type { PaymentsProvider } from '../types.js'

export type PaymentsAnswers = {
  payments: PaymentsProvider | null
}

type PaymentsOption = PaymentsProvider | 'none'

export async function promptPayments(): Promise<PaymentsAnswers> {
  const payments = await p.select<PaymentsOption>({
    message: 'Payments provider',
    options: [
      { value: 'stripe', label: 'Stripe' },
      { value: 'lemonsqueezy', label: 'Lemon Squeezy' },
      { value: 'none', label: 'Skip' },
    ],
  })

  if (p.isCancel(payments)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  return { payments: payments === 'none' ? null : (payments as PaymentsProvider) }
}
