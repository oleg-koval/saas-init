import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) {
  throw new Error('Missing required environment variable: STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2025-01-27.acacia',
})
