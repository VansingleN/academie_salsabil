import assert from 'node:assert/strict'
import { createCartQuote } from '../src/server/cartQuote.js'
import {
  createMemoryOrderRepository
} from '../src/server/orderRepository.js'
import {
  ensureStripeSubscriptionSchedule
} from '../src/server/stripeSubscriptionSchedule.js'

function stripeResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

const monthlyQuote = createCartQuote({
  items: [{
    cartItemId: 'schedule-primary-cp',
    offerId: 'primary-cp-monthly',
    selections: {
      billingCountry: 'FR',
      timeSlot: 'morning',
      arabicLanguage: 'arabic'
    }
  }]
}, { enrollmentDate: '2026-06-09' })
const repository = createMemoryOrderRepository()
const monthlyOrder = {
  id: 'ord_schedule_monthly',
  status: 'initial_payment_paid',
  paymentStatus: 'paid',
  currency: 'eur',
  items: monthlyQuote.items,
  scheduleStatus: 'awaiting_initial_payment'
}
await repository.saveOrder(monthlyOrder)

const requests = []
const scheduledOrder = await ensureStripeSubscriptionSchedule({
  order: monthlyOrder,
  checkoutSession: {
    customer: 'cus_schedule',
    payment_intent: 'pi_schedule'
  },
  secretKey: 'sk_test_placeholder',
  orderRepository: repository,
  now: () => '2026-06-09T12:00:00.000Z',
  fetchImpl: async (url, options) => {
    requests.push({ url, options })

    if (url.endsWith('/payment_intents/pi_schedule')) {
      return stripeResponse({ id: 'pi_schedule', payment_method: 'pm_schedule' })
    }

    if (url.endsWith('/prices')) {
      return stripeResponse({ id: 'price_schedule_primary' })
    }

    return stripeResponse({
      id: 'sub_sched_academie',
      subscription: null
    })
  }
})

assert.equal(scheduledOrder.status, 'scheduled')
assert.equal(scheduledOrder.subscriptionScheduleId, 'sub_sched_academie')
assert.equal(scheduledOrder.scheduleStartDate, '2026-10-07')
assert.equal(scheduledOrder.futureInstallmentCount, 9)
assert.equal(requests.length, 3)

const priceParameters = new URLSearchParams(requests[1].options.body)
assert.equal(priceParameters.get('unit_amount'), '34400')
assert.equal(priceParameters.get('recurring[interval]'), 'month')
assert.equal(priceParameters.get('recurring[interval_count]'), '1')
assert.equal(priceParameters.get('tax_behavior'), 'exclusive')
assert.equal(
  requests[1].options.headers['Idempotency-Key'],
  'ord_schedule_monthly:price:schedule-primary-cp'
)

const scheduleParameters = new URLSearchParams(requests[2].options.body)
assert.equal(scheduleParameters.get('end_behavior'), 'cancel')
assert.equal(
  scheduleParameters.get('default_settings[automatic_tax][enabled]'),
  'false'
)
assert.equal(
  scheduleParameters.get('default_settings[default_payment_method]'),
  'pm_schedule'
)
assert.equal(scheduleParameters.get('phases[0][duration][interval]'), 'month')
assert.equal(scheduleParameters.get('phases[0][duration][interval_count]'), '9')
assert.equal(
  scheduleParameters.get('phases[0][billing_cycle_anchor]'),
  'phase_start'
)
assert.equal(scheduleParameters.get('phases[0][items][0][price]'), 'price_schedule_primary')
assert.equal(
  requests[2].options.headers['Idempotency-Key'],
  'ord_schedule_monthly:subscription-schedule'
)

// Une commande déjà provisionnée ne doit effectuer aucun nouvel appel Stripe.
let duplicateCallCount = 0
await ensureStripeSubscriptionSchedule({
  order: scheduledOrder,
  checkoutSession: {
    customer: 'cus_schedule',
    payment_intent: 'pi_schedule'
  },
  secretKey: 'sk_test_placeholder',
  orderRepository: repository,
  fetchImpl: async () => {
    duplicateCallCount += 1
    return stripeResponse({})
  }
})
assert.equal(duplicateCallCount, 0)

const annualQuote = createCartQuote({
  items: [{
    cartItemId: 'schedule-preschool-annual',
    offerId: 'preschool-ps-annual',
    selections: {
      billingCountry: 'FR',
      timeSlot: 'afternoon'
    }
  }]
}, { enrollmentDate: '2026-06-09' })
const annualOrder = {
  id: 'ord_schedule_annual',
  status: 'initial_payment_paid',
  paymentStatus: 'paid',
  currency: 'eur',
  items: annualQuote.items
}
let annualCallCount = 0
const completedAnnualOrder = await ensureStripeSubscriptionSchedule({
  order: annualOrder,
  checkoutSession: {},
  secretKey: 'sk_test_placeholder',
  orderRepository: repository,
  fetchImpl: async () => {
    annualCallCount += 1
    return stripeResponse({})
  }
})

assert.equal(completedAnnualOrder.status, 'paid')
assert.equal(completedAnnualOrder.scheduleStatus, 'not_required')
assert.equal(annualCallCount, 0)

// Une erreur Stripe est persistée et reste retentable par le webhook.
const failedOrder = {
  ...monthlyOrder,
  id: 'ord_schedule_failure'
}
await assert.rejects(
  ensureStripeSubscriptionSchedule({
    order: failedOrder,
    checkoutSession: {
      customer: 'cus_failure',
      payment_intent: 'pi_failure'
    },
    secretKey: 'sk_test_placeholder',
    orderRepository: repository,
    fetchImpl: async () => stripeResponse(
      { error: { type: 'api_error' } },
      500
    )
  }),
  (error) => error.code === 'STRIPE_API_ERROR'
)
assert.equal(
  (await repository.getOrder('ord_schedule_failure')).scheduleStatus,
  'failed'
)

console.log('Subscription Schedule Stripe : tests réussis')
