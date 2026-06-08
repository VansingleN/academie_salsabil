import assert from 'node:assert/strict'
import {
  buildCheckoutParameters,
  createStripeCheckoutSession
} from '../src/server/stripeCheckout.js'
import { createCartQuote } from '../src/server/cartQuote.js'
import {
  createMemoryOrderRepository
} from '../src/server/orderRepository.js'

function createStripeResponse() {
  return new Response(JSON.stringify({
    id: 'cs_test_academie_salsabil',
    url: 'https://checkout.stripe.com/c/pay/cs_test_academie_salsabil'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

const monthlyPayload = {
  items: [{
    cartItemId: 'checkout-primary-cp',
    offerId: 'primary-cp-monthly',
    selections: {
      timeSlot: 'morning',
      arabicLanguage: 'arabic'
    }
  }]
}

// Le générateur doit convertir 344 € en centimes et créer un abonnement mensuel.
const monthlyQuote = createCartQuote(monthlyPayload)
const monthlyParameters = buildCheckoutParameters(
  monthlyQuote,
  'https://academie-salsabil.netlify.app'
)

assert.equal(monthlyParameters.mode, 'subscription')
assert.equal(monthlyParameters.parameters.get('line_items[0][price_data][unit_amount]'), '34400')
assert.equal(
  monthlyParameters.parameters.get('line_items[0][price_data][recurring][interval]'),
  'month'
)
assert.equal(
  monthlyParameters.parameters.get('line_items[0][price_data][recurring][interval_count]'),
  '1'
)
assert.equal(
  monthlyParameters.parameters.get('subscription_data[metadata][order_id]'),
  'order_preview'
)

const annualQuote = createCartQuote({
  items: [{
    cartItemId: 'checkout-preschool-annual',
    offerId: 'preschool-ps-annual',
    selections: { timeSlot: 'afternoon' }
  }]
})
const annualParameters = buildCheckoutParameters(
  annualQuote,
  'https://academie-salsabil.netlify.app'
)

assert.equal(annualParameters.mode, 'payment')
assert.equal(annualParameters.parameters.get('customer_creation'), 'always')
assert.equal(
  annualParameters.parameters.has('line_items[0][price_data][recurring][interval]'),
  false
)
assert.equal(
  annualParameters.parameters.get('payment_intent_data[metadata][order_id]'),
  'order_preview'
)

let capturedRequest
const checkout = await createStripeCheckoutSession({
  payload: monthlyPayload,
  secretKey: 'sk_test_placeholder',
  siteUrl: 'https://academie-salsabil.netlify.app/',
  orderRepository: createMemoryOrderRepository(),
  orderIdGenerator: () => 'ord_checkout_test',
  fetchImpl: async (url, options) => {
    capturedRequest = { url, options }
    return createStripeResponse()
  }
})

assert.equal(checkout.checkoutReady, true)
assert.equal(checkout.testMode, true)
assert.equal(checkout.mode, 'subscription')
assert.equal(checkout.orderId, 'ord_checkout_test')
assert.equal(capturedRequest.url, 'https://api.stripe.com/v1/checkout/sessions')
assert.equal(
  capturedRequest.options.headers.Authorization,
  'Bearer sk_test_placeholder'
)
assert.equal(
  new URLSearchParams(capturedRequest.options.body).get('metadata[order_id]'),
  'ord_checkout_test'
)

// Une clé live reste refusée tant que le projet n'est pas explicitement passé en production.
await assert.rejects(
  createStripeCheckoutSession({
    payload: monthlyPayload,
    secretKey: 'sk_live_forbidden',
    siteUrl: 'https://academie-salsabil.netlify.app',
    orderRepository: createMemoryOrderRepository(),
    fetchImpl: async () => createStripeResponse()
  }),
  (error) => error.code === 'STRIPE_TEST_MODE_REQUIRED'
)

// Plusieurs rythmes nécessiteront une règle commerciale avant d'être payés ensemble.
await assert.rejects(
  createStripeCheckoutSession({
    payload: {
      items: [
        monthlyPayload.items[0],
        {
          cartItemId: 'checkout-primary-ce1-annual',
          offerId: 'primary-ce1-annual',
          selections: {
            timeSlot: 'morning',
            arabicLanguage: 'none'
          }
        }
      ]
    },
    secretKey: 'sk_test_placeholder',
    siteUrl: 'https://academie-salsabil.netlify.app',
    orderRepository: createMemoryOrderRepository(),
    fetchImpl: async () => createStripeResponse()
  }),
  (error) => error.code === 'MIXED_BILLING_PLANS'
)

console.log('Stripe Checkout : tests réussis')
