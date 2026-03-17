import * as postmark from 'postmark'

const apiToken = process.env.POSTMARK_API_TOKEN
if (!apiToken) {
  throw new Error('Missing required environment variable: POSTMARK_API_TOKEN')
}

const client = new postmark.ServerClient(apiToken)

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await client.sendEmail({
    From: 'noreply@example.com',
    To: to,
    Subject: subject,
    HtmlBody: html,
  })
}
