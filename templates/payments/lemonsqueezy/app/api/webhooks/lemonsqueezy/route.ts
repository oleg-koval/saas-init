import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing x-signature header' }, { status: 400 })
  }

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(body).digest('hex')

  const sigBuf = Buffer.from(signature)
  const digBuf = Buffer.from(digest)
  if (sigBuf.length !== digBuf.length || !crypto.timingSafeEqual(sigBuf, digBuf)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  let event: ReturnType<typeof JSON.parse>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const eventName: string = event?.meta?.event_name

  switch (eventName) {
    case 'order_created': {
      // TODO: handle new order
      console.log('Order created:', event?.data?.id)
      break
    }
    case 'subscription_created':
    case 'subscription_updated':
    case 'subscription_cancelled': {
      // TODO: handle subscription events
      console.log('Subscription event:', eventName, event?.data?.id)
      break
    }
    default:
      console.log('Unhandled event type:', eventName)
  }

  return NextResponse.json({ received: true })
}
