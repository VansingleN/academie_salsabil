import assert from 'node:assert/strict'
import {
  createMemoryOrderRepository,
  createNetlifyBlobsOrderRepository
} from '../src/server/orderRepository.js'
import {
  createTransactionalEmailService,
  TransactionalEmailError
} from '../src/server/transactionalEmailService.js'
import {
  buildTransactionalEmailMessages,
  EMAIL_TEMPLATE_IDS
} from '../src/server/transactionalEmailTemplates.js'

function createEvent(id, type, object = {}) {
  return { id, type, data: { object } }
}

function createOrder(overrides = {}) {
  return {
    id: 'ord_email_test',
    publicOrderNumber: 'AS-2627-EMAILTES',
    status: 'scheduled',
    scheduleStatus: 'scheduled',
    futureInstallmentCount: 9,
    scheduleStartDate: '2026-10-07',
    paymentSummary: {
      firstPaymentExcludingTax: 419
    },
    enrollment: {
      guardian: {
        firstName: 'Amira',
        lastName: 'Benali',
        email: 'parent@example.com'
      },
      students: [{
        cartItemId: 'email-primary-cp',
        firstName: 'Yasmine',
        birthDate: '2018-03-15',
        learningObjectives: 'Cette information sensible ne doit pas sortir.',
        accommodations: 'DYS'
      }]
    },
    items: [{
      cartItemId: 'email-primary-cp',
      curriculum: 'Primaire',
      grade: 'CP',
      plan: 'Mensuel',
      paymentSchedule: {
        futurePayments: [{ dueDate: '2026-10-07' }]
      }
    }],
    ...overrides
  }
}

const scheduledOrder = createOrder()
const checkoutEvent = createEvent(
  'evt_email_checkout',
  'checkout.session.completed',
  { payment_status: 'paid' }
)
const checkoutMessages = buildTransactionalEmailMessages({
  event: checkoutEvent,
  order: scheduledOrder,
  internalRecipient: 'equipe@example.test'
})

assert.equal(checkoutMessages.length, 4)
assert.deepEqual(
  new Set(checkoutMessages.map((message) => message.templateId)),
  new Set([
    EMAIL_TEMPLATE_IDS.initialPaymentConfirmed,
    EMAIL_TEMPLATE_IDS.scheduleCreated
  ])
)
const renderedCheckout = JSON.stringify(checkoutMessages)
assert.equal(renderedCheckout.includes('Cette information sensible'), false)
assert.equal(renderedCheckout.includes('2018-03-15'), false)
assert.equal(renderedCheckout.includes('DYS'), false)
assert.equal(renderedCheckout.includes('parent@example.com'), true)

const eventCases = [
  ['invoice.paid', EMAIL_TEMPLATE_IDS.installmentPaid],
  ['invoice.payment_failed', EMAIL_TEMPLATE_IDS.paymentFailed],
  ['customer.subscription.deleted', EMAIL_TEMPLATE_IDS.subscriptionCancelled]
]

for (const [type, templateId] of eventCases) {
  const messages = buildTransactionalEmailMessages({
    event: createEvent(`evt_${templateId}`, type, {
      amount_paid: 32900,
      amount_due: 32900
    }),
    order: scheduledOrder,
    internalRecipient: 'equipe@example.test'
  })

  assert.equal(messages.length, 2)
  assert.equal(messages[0].templateId, templateId)
}

const repository = createMemoryOrderRepository()
const sentMessages = []
const safeLogs = []
const previewService = createTransactionalEmailService({
  mode: 'preview',
  internalRecipient: 'equipe@example.test',
  provider: {
    async send(message) {
      sentMessages.push(message)
      return { id: `preview-${sentMessages.length}` }
    }
  },
  logger: {
    info(message, data) {
      safeLogs.push({ message, data })
    },
    error() {}
  },
  now: () => '2026-06-09T20:00:00.000Z'
})

const firstResults = await previewService.handleEvent({
  event: checkoutEvent,
  order: scheduledOrder,
  orderRepository: repository
})
const duplicateResults = await previewService.handleEvent({
  event: checkoutEvent,
  order: scheduledOrder,
  orderRepository: repository
})

assert.equal(firstResults.every((result) => result.status === 'previewed'), true)
assert.equal(duplicateResults.every((result) => result.status === 'duplicate'), true)
assert.equal(sentMessages.length, 4)
assert.equal(
  sentMessages.every((message) =>
    message.idempotencyKey.startsWith('evt_email_checkout:')),
  true
)
assert.equal(
  JSON.stringify(safeLogs).includes('parent@example.com'),
  false
)
assert.equal(JSON.stringify(safeLogs).includes('Amira'), false)

// Netlify Blobs réserve atomiquement une livraison avec onlyIfNew.
const blobValues = new Map()
const blobStore = {
  async getWithMetadata(key) {
    const value = blobValues.get(key)
    return value
      ? { data: value.data, etag: value.etag }
      : null
  },
  async setJSON(key, data, options = {}) {
    if (options.onlyIfNew && blobValues.has(key)) {
      return { modified: false }
    }

    blobValues.set(key, { data, etag: `etag-${blobValues.size + 1}` })
    return { modified: true, etag: blobValues.get(key).etag }
  },
  async get(key) {
    return blobValues.get(key)?.data ?? null
  }
}
const blobsRepository = createNetlifyBlobsOrderRepository({
  store: blobStore
})
const atomicClaim = {
  id: 'evt_atomic:installment_paid:family',
  status: 'processing',
  claimExpiresAt: '2999-01-01T00:00:00.000Z'
}
assert.equal(await blobsRepository.claimEmailDelivery(atomicClaim), true)
assert.equal(await blobsRepository.claimEmailDelivery(atomicClaim), false)

// Un échec fournisseur reste retentable, mais les messages déjà terminés ne
// sont jamais renvoyés lors du rejeu.
const retryRepository = createMemoryOrderRepository()
let attempts = 0
const retryService = createTransactionalEmailService({
  mode: 'provider',
  internalRecipient: 'equipe@example.test',
  provider: {
    async send() {
      attempts += 1
      if (attempts === 1) {
        const error = new Error('Indisponible')
        error.code = 'PROVIDER_DOWN'
        throw error
      }
      return { id: 'provider-ok' }
    }
  },
  logger: { info() {}, error() {} },
  now: () => '2026-06-09T20:05:00.000Z'
})

await assert.rejects(
  retryService.handleEvent({
    event: createEvent(
      'evt_retry_email',
      'invoice.payment_failed',
      { amount_due: 32900 }
    ),
    order: scheduledOrder,
    orderRepository: retryRepository
  }),
  TransactionalEmailError
)
const retryResults = await retryService.handleEvent({
  event: createEvent(
    'evt_retry_email',
    'invoice.payment_failed',
    { amount_due: 32900 }
  ),
  order: scheduledOrder,
  orderRepository: retryRepository
})

assert.equal(attempts, 3)
assert.equal(retryResults[0].status, 'sent')
assert.equal(retryResults[1].status, 'sent')

// Un refus définitif est conservé sans lever d'erreur : Stripe ne doit pas
// rejouer éternellement un webhook pour une adresse refusée par le fournisseur.
const rejectedRepository = createMemoryOrderRepository()
const rejectedService = createTransactionalEmailService({
  mode: 'provider',
  internalRecipient: 'equipe@example.test',
  provider: {
    async send() {
      const error = new Error('Adresse refusée')
      error.code = 'PROVIDER_PERMANENT_ERROR'
      error.retryable = false
      throw error
    }
  },
  logger: { info() {}, error() {} },
  now: () => '2026-06-09T20:06:00.000Z'
})
const rejectedResults = await rejectedService.handleEvent({
  event: createEvent(
    'evt_rejected_email',
    'invoice.payment_failed',
    { amount_due: 32900 }
  ),
  order: scheduledOrder,
  orderRepository: rejectedRepository
})
assert.equal(
  rejectedResults.every((result) => result.status === 'rejected'),
  true
)

// Une réservation encore active bloque la clôture du webhook ; elle ne doit
// pas être prise pour un envoi déjà terminé.
const processingRepository = createMemoryOrderRepository()
const processingId =
  'evt_processing:installment_paid:family'
await processingRepository.claimEmailDelivery({
  id: processingId,
  status: 'processing',
  claimExpiresAt: '2999-01-01T00:00:00.000Z'
})
await assert.rejects(
  previewService.handleEvent({
    event: createEvent(
      'evt_processing',
      'invoice.paid',
      { amount_paid: 32900 }
    ),
    order: scheduledOrder,
    orderRepository: processingRepository
  }),
  (error) => error.code === 'EMAIL_DELIVERY_IN_PROGRESS'
)

console.log('E-mails transactionnels : tests réussis')
