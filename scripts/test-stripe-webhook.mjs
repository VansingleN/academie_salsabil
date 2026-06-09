import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import {
  createMemoryOrderRepository,
  createNetlifyBlobsOrderRepository
} from '../src/server/orderRepository.js'
import {
  processStripeEvent,
  StripeWebhookError,
  verifyStripeWebhook
} from '../src/server/stripeWebhook.js'

const webhookSecret = 'whsec_local_test'
const timestamp = 1_800_000_000

// Le stockage Netlify doit contourner le cache distribué pour les commandes
// et les reçus d'événements qui viennent d'être écrits par une autre Function.
const blobReads = []
const blobsRepository = createNetlifyBlobsOrderRepository({
  store: {
    async get(key, options) {
      blobReads.push({ key, options })
      return null
    },
    async setJSON() {}
  }
})
await blobsRepository.getOrder('ord_consistency')
await blobsRepository.getProcessedEvent('evt_consistency')
assert.equal(blobReads.length, 2)
assert.deepEqual(blobReads[0].options, {
  type: 'json',
  consistency: 'strong'
})
assert.deepEqual(blobReads[1].options, {
  type: 'json',
  consistency: 'strong'
})

function sign(rawBody, signedAt = timestamp) {
  const signature = createHmac('sha256', webhookSecret)
    .update(`${signedAt}.${rawBody}`)
    .digest('hex')

  return `t=${signedAt},v1=${signature}`
}

function createEvent(id, type, object) {
  return { id, type, data: { object } }
}

const signedBody = JSON.stringify(
  createEvent('evt_signature', 'checkout.session.completed', { id: 'cs_test_1' })
)
const verifiedEvent = verifyStripeWebhook({
  rawBody: signedBody,
  signatureHeader: sign(signedBody),
  webhookSecret,
  nowSeconds: () => timestamp
})

assert.equal(verifiedEvent.id, 'evt_signature')

assert.throws(
  () => verifyStripeWebhook({
    rawBody: `${signedBody} `,
    signatureHeader: sign(signedBody),
    webhookSecret,
    nowSeconds: () => timestamp
  }),
  StripeWebhookError
)

assert.throws(
  () => verifyStripeWebhook({
    rawBody: signedBody,
    signatureHeader: sign(signedBody, timestamp - 301),
    webhookSecret,
    nowSeconds: () => timestamp
  }),
  StripeWebhookError
)

const repository = createMemoryOrderRepository()
await repository.saveOrder({
  id: 'ord_subscription',
  status: 'checkout_created',
  paymentStatus: 'unpaid',
  checkoutSessionId: 'cs_test_subscription',
  items: [{
    paymentSchedule: {
      futurePayments: [{ dueDate: '2026-10-07' }]
    }
  }],
  createdAt: '2026-06-08T10:00:00.000Z',
  updatedAt: '2026-06-08T10:00:00.000Z'
})

const completedEvent = createEvent(
  'evt_checkout_completed',
  'checkout.session.completed',
  {
    id: 'cs_test_subscription',
    mode: 'payment',
    payment_status: 'paid',
    customer: 'cus_test',
    payment_intent: 'pi_test',
    customer_details: { email: 'parent@example.com' },
    metadata: { order_id: 'ord_subscription' }
  }
)
const notificationCalls = []
const completedResult = await processStripeEvent({
  event: completedEvent,
  orderRepository: repository,
  scheduleProvisioner: async ({ order, orderRepository }) => {
    const scheduledOrder = {
      ...order,
      status: 'scheduled',
      scheduleStatus: 'scheduled',
      subscriptionScheduleId: 'sub_sched_test',
      subscriptionId: 'sub_test'
    }
    await orderRepository.saveOrder(scheduledOrder)
    return scheduledOrder
  },
  notificationService: {
    async handleEvent({ event, order }) {
      notificationCalls.push({
        eventId: event.id,
        orderStatus: order.status
      })
    }
  },
  now: () => '2026-06-08T10:01:00.000Z'
})
const activeOrder = await repository.getOrder('ord_subscription')

assert.equal(completedResult.duplicate, false)
assert.equal(activeOrder.status, 'scheduled')
assert.equal(activeOrder.subscriptionScheduleId, 'sub_sched_test')
assert.equal(activeOrder.subscriptionId, 'sub_test')
assert.deepEqual(notificationCalls, [{
  eventId: 'evt_checkout_completed',
  orderStatus: 'scheduled'
}])
assert.equal(
  (await repository.findOrderBySubscription('sub_test')).id,
  'ord_subscription'
)

const duplicateResult = await processStripeEvent({
  event: completedEvent,
  orderRepository: repository,
  scheduleProvisioner: async () => {
    throw new Error('Le provisionnement ne doit pas être rejoué.')
  },
  notificationService: {
    async handleEvent() {
      throw new Error('Les notifications ne doivent pas être rejouées.')
    }
  }
})
assert.equal(duplicateResult.duplicate, true)

await processStripeEvent({
  event: createEvent('evt_invoice_failed', 'invoice.payment_failed', {
    id: 'in_failed',
    customer: 'cus_test',
    subscription: 'sub_test'
  }),
  orderRepository: repository
})
assert.equal((await repository.getOrder('ord_subscription')).status, 'past_due')

await processStripeEvent({
  event: createEvent('evt_invoice_paid', 'invoice.paid', {
    id: 'in_paid',
    customer: 'cus_test',
    subscription: 'sub_test'
  }),
  orderRepository: repository
})
assert.equal((await repository.getOrder('ord_subscription')).status, 'active')

await processStripeEvent({
  event: createEvent('evt_subscription_deleted', 'customer.subscription.deleted', {
    id: 'sub_test'
  }),
  orderRepository: repository
})
assert.equal((await repository.getOrder('ord_subscription')).status, 'cancelled')

await repository.saveOrder({
  id: 'ord_expired',
  status: 'checkout_created',
  paymentStatus: 'unpaid',
  checkoutSessionId: 'cs_test_expired'
})
await processStripeEvent({
  event: createEvent('evt_checkout_expired', 'checkout.session.expired', {
    id: 'cs_test_expired',
    payment_status: 'unpaid',
    metadata: { order_id: 'ord_expired' }
  }),
  orderRepository: repository
})
assert.equal((await repository.getOrder('ord_expired')).status, 'expired')

// Une facture peut retrouver sa commande grâce aux métadonnées de l'abonnement,
// même si l'index de souscription n'a pas encore été créé.
await repository.saveOrder({
  id: 'ord_out_of_order',
  status: 'checkout_created',
  checkoutSessionId: 'cs_test_out_of_order'
})
await processStripeEvent({
  event: createEvent('evt_invoice_first', 'invoice.paid', {
    id: 'in_first',
    parent: {
      subscription_details: {
        subscription: 'sub_out_of_order',
        metadata: { order_id: 'ord_out_of_order' }
      }
    }
  }),
  orderRepository: repository
})
assert.equal((await repository.getOrder('ord_out_of_order')).status, 'active')

await assert.rejects(
  processStripeEvent({
    event: createEvent('evt_missing_order', 'invoice.paid', {
      id: 'in_missing',
      subscription: 'sub_missing'
    }),
    orderRepository: repository
  }),
  (error) => error.code === 'WEBHOOK_ORDER_NOT_READY'
)
assert.equal(await repository.getProcessedEvent('evt_missing_order'), null)

const retryRepository = createMemoryOrderRepository()
await retryRepository.saveOrder({
  id: 'ord_schedule_retry',
  status: 'checkout_created',
  paymentStatus: 'unpaid',
  checkoutSessionId: 'cs_test_schedule_retry',
  items: [{
    paymentSchedule: {
      futurePayments: [{ dueDate: '2026-10-07' }]
    }
  }]
})
const retryEvent = createEvent(
  'evt_schedule_retry',
  'checkout.session.completed',
  {
    id: 'cs_test_schedule_retry',
    mode: 'payment',
    payment_status: 'paid',
    customer: 'cus_retry',
    payment_intent: 'pi_retry',
    metadata: { order_id: 'ord_schedule_retry' }
  }
)

await assert.rejects(
  processStripeEvent({
    event: retryEvent,
    orderRepository: retryRepository,
    scheduleProvisioner: async () => {
      const error = new Error('Stripe temporairement indisponible')
      error.code = 'TEMPORARY_SCHEDULE_ERROR'
      throw error
    }
  }),
  (error) => error.code === 'TEMPORARY_SCHEDULE_ERROR'
)
assert.equal(
  await retryRepository.getProcessedEvent('evt_schedule_retry'),
  null
)
assert.equal(
  (await retryRepository.getOrder('ord_schedule_retry')).status,
  'initial_payment_paid'
)

console.log('Webhook Stripe : tests réussis')
