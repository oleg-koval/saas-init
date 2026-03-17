import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

// lemonSqueezySetup configures the global client. Import API functions directly:
// import { listProducts, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error('Lemon Squeezy error:', error),
})
