import * as postmark from 'postmark'

const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN!)

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await client.sendEmail({
    From: 'noreply@example.com',
    To: to,
    Subject: subject,
    HtmlBody: html,
  })
}
