import assert from 'node:assert/strict'
import {
  createMemoryOrderRepository
} from '../src/server/orderRepository.js'
import { StripeApiError } from '../src/server/stripeApi.js'
import {
  createCustomerPortalSession,
  verifyCheckoutSession
} from '../src/server/stripeSession.js'

function stripeResponse(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

const repository = createMemoryOrderRepository()
const order = {
  id: 'ord_verify',
  status: 'checkout_created',
  paymentStatus: 'unpaid',
  checkoutSessionId: 'cs_test_verify'
}
await repository.saveOrder(order)

const checkoutSession = {
  id: 'cs_test_verify',
  status: 'complete',
  payment_status: 'paid',
  mode: 'subscription',
  customer: 'cus_verify',
  metadata: {
    source: 'academie_salsabil_guest_cart',
    order_id: 'ord_verify'
  }
}

const pendingVerification = await verifyCheckoutSession({
  sessionId: checkoutSession.id,
  secretKey: 'sk_test_placeholder',
  orderRepository: repository,
  portalEnabled: true,
  fetchImpl: async () => stripeResponse(checkoutSession)
})

// Même si Stripe annonce "paid", seule la commande mise à jour par le webhook
// autorise le serveur à répondre qu'elle est confirmée.
assert.equal(pendingVerification.paymentStatus, 'paid')
assert.equal(pendingVerification.confirmed, false)

await repository.saveOrder({ ...order, status: 'active', paymentStatus: 'paid' })
const confirmedVerification = await verifyCheckoutSession({
  sessionId: checkoutSession.id,
  secretKey: 'sk_test_placeholder',
  orderRepository: repository,
  portalEnabled: true,
  fetchImpl: async () => stripeResponse(checkoutSession)
})
assert.equal(confirmedVerification.confirmed, true)
assert.equal(confirmedVerification.portalAvailable, true)

await assert.rejects(
  createCustomerPortalSession({
    sessionId: checkoutSession.id,
    secretKey: 'sk_test_placeholder',
    orderRepository: repository,
    siteUrl: 'https://academie-salsabil.netlify.app',
    portalEnabled: false,
    fetchImpl: async () => stripeResponse(checkoutSession)
  }),
  StripeApiError
)

const requests = []
const portal = await createCustomerPortalSession({
  sessionId: checkoutSession.id,
  secretKey: 'sk_test_placeholder',
  orderRepository: repository,
  siteUrl: 'https://academie-salsabil.netlify.app/',
  portalEnabled: true,
  fetchImpl: async (url, options) => {
    requests.push({ url, options })
    return requests.length === 1
      ? stripeResponse(checkoutSession)
      : stripeResponse({ url: 'https://billing.stripe.com/p/session/test' })
  }
})

assert.equal(portal.portalReady, true)
assert.equal(requests.length, 2)
assert.equal(
  new URLSearchParams(requests[1].options.body).get('customer'),
  'cus_verify'
)

console.log('Sessions Stripe : tests réussis')
