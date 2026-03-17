import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

const apiKey = process.env.LEMONSQUEEZY_API_KEY
if (!apiKey) {
  throw new Error('Missing required environment variable: LEMONSQUEEZY_API_KEY')
}

// lemonSqueezySetup configures the global client. Import API functions directly:
// import { listProducts, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
lemonSqueezySetup({
  apiKey,
  onError: (error) => console.error('Lemon Squeezy error:', error),
})
