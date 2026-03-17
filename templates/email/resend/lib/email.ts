import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

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
