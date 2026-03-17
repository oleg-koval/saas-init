import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  throw new Error('Missing required environment variable: RESEND_API_KEY')
}

const resend = new Resend(apiKey)

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: 'noreply@example.com',
    to,
    subject,
    html,
  })
  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}
