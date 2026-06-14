import { requestStripe, StripeApiError } from './stripeApi.js'

function getId(value) {
  return typeof value === 'string' ? value : value?.id ?? null
}

function toUnixTimestamp(dateValue) {
  return Math.floor(new Date(`${dateValue}T12:00:00.000Z`).getTime() / 1000)
}

function getFuturePaymentConfiguration(order) {
  const recurringItems = order.items.filter(
    (item) => item.paymentSchedule.futurePayments.length > 0
  )

  if (recurringItems.length === 0) return null

  const referenceSchedule = recurringItems[0].paymentSchedule
  const futureCount = referenceSchedule.futurePayments.length
  const firstDueDate = referenceSchedule.futurePayments[0].dueDate
  const intervalCount = recurringItems[0].intervalCount

  for (const item of recurringItems) {
    const futurePayments = item.paymentSchedule.futurePayments
    const amounts = new Set(
      futurePayments.map((payment) => payment.subtotalExcludingTax)
    )

    if (
      futurePayments.length !== futureCount
      || futurePayments[0].dueDate !== firstDueDate
      || item.intervalCount !== intervalCount
      || amounts.size !== 1
    ) {
      throw new StripeApiError(
        'Les échéances futures ne peuvent pas être regroupées dans un même abonnement.',
        409,
        'INCOMPATIBLE_FUTURE_SCHEDULES'
      )
    }
  }

  return {
    recurringItems,
    futureCount,
    firstDueDate,
    intervalCount,
    phaseDurationInMonths: futureCount * intervalCount
  }
}

async function retrievePaymentMethod({
  paymentIntentId,
  secretKey,
  fetchImpl
}) {
  const paymentIntent = await requestStripe({
    path: `/payment_intents/${encodeURIComponent(paymentIntentId)}`,
    secretKey,
    fetchImpl
  })
  const paymentMethodId = getId(paymentIntent.payment_method)

  if (!paymentMethodId) {
    throw new StripeApiError(
      'Le moyen de paiement du premier règlement est indisponible.',
      503,
      'PAYMENT_METHOD_NOT_READY'
    )
  }

  return paymentMethodId
}

async function createRecurringPrices({
  order,
  configuration,
  secretKey,
  fetchImpl
}) {
  return Promise.all(configuration.recurringItems.map(async (item) => {
    const amount = item.paymentSchedule.futurePayments[0].subtotalExcludingTax
    const parameters = new URLSearchParams()

    parameters.set('currency', order.currency)
    parameters.set('unit_amount', String(Math.round(amount * 100)))
    parameters.set('recurring[interval]', 'month')
    parameters.set(
      'recurring[interval_count]',
      String(configuration.intervalCount)
    )
    parameters.set(
      'product_data[name]',
      `${item.curriculum} · ${item.grade} · ${item.plan}`
    )
    parameters.set(
      'product_data[metadata][offer_id]',
      item.offerId
    )
    parameters.set('metadata[order_id]', order.id)
    parameters.set('metadata[cart_item_id]', item.cartItemId)
    parameters.set('metadata[tax_mode]', 'disabled')
    parameters.set('tax_behavior', 'exclusive')

    const price = await requestStripe({
      path: '/prices',
      method: 'POST',
      parameters,
      secretKey,
      idempotencyKey: `${order.id}:price:${item.cartItemId}`,
      fetchImpl
    })

    if (!price.id) {
      throw new StripeApiError(
        'Stripe n’a pas renvoyé le tarif récurrent attendu.',
        502,
        'STRIPE_INVALID_RESPONSE'
      )
    }

    return {
      cartItemId: item.cartItemId,
      priceId: price.id,
      amount
    }
  }))
}

function buildScheduleParameters({
  order,
  customerId,
  paymentMethodId,
  configuration,
  recurringPrices
}) {
  const parameters = new URLSearchParams()

  parameters.set('customer', customerId)
  parameters.set('start_date', String(toUnixTimestamp(configuration.firstDueDate)))
  parameters.set('end_behavior', 'cancel')
  parameters.set('default_settings[collection_method]', 'charge_automatically')
  parameters.set('default_settings[automatic_tax][enabled]', 'false')
  parameters.set(
    'default_settings[default_payment_method]',
    paymentMethodId
  )
  parameters.set('metadata[source]', 'academie_salsabil_school_schedule')
  parameters.set('metadata[order_id]', order.id)
  parameters.set('metadata[school_year_id]', order.items[0].paymentSchedule.schoolYearId)
  parameters.set('phases[0][duration][interval]', 'month')
  parameters.set(
    'phases[0][duration][interval_count]',
    String(configuration.phaseDurationInMonths)
  )
  parameters.set('phases[0][proration_behavior]', 'none')
  parameters.set('phases[0][billing_cycle_anchor]', 'phase_start')
  parameters.set('phases[0][metadata][order_id]', order.id)
  parameters.set('phases[0][metadata][source]', 'academie_salsabil_school_schedule')

  recurringPrices.forEach((price, index) => {
    parameters.set(`phases[0][items][${index}][price]`, price.priceId)
    parameters.set(`phases[0][items][${index}][quantity]`, '1')
  })

  return parameters
}

// Toutes les créations utilisent des clés d'idempotence dérivées de la
// commande. Un retry du webhook récupère donc les mêmes objets Stripe.
export async function ensureStripeSubscriptionSchedule({
  order,
  checkoutSession,
  secretKey,
  orderRepository,
  fetchImpl = fetch,
  now = () => new Date().toISOString()
}) {
  if (order.subscriptionScheduleId) {
    return order
  }

  const hasManualBalance = order.items.some(
    (item) => item.paymentSchedule.manualPayments?.length > 0
  )

  if (hasManualBalance) {
    const pendingOrder = {
      ...order,
      status: 'deposit_paid',
      scheduleStatus: 'manual_balance_pending',
      updatedAt: now()
    }
    await orderRepository.saveOrder(pendingOrder)
    return pendingOrder
  }

  const configuration = getFuturePaymentConfiguration(order)

  if (!configuration) {
    const completedOrder = {
      ...order,
      status: 'paid',
      scheduleStatus: 'not_required',
      updatedAt: now()
    }
    await orderRepository.saveOrder(completedOrder)
    return completedOrder
  }

  const customerId = getId(checkoutSession.customer)
  const paymentIntentId = getId(checkoutSession.payment_intent)

  if (!customerId || !paymentIntentId) {
    throw new StripeApiError(
      'Stripe n’a pas encore fourni les références nécessaires à l’échéancier.',
      503,
      'SCHEDULE_REFERENCES_NOT_READY'
    )
  }

  await orderRepository.saveOrder({
    ...order,
    status: 'schedule_provisioning',
    scheduleStatus: 'provisioning',
    customerId,
    initialPaymentIntentId: paymentIntentId,
    updatedAt: now()
  })

  try {
    const paymentMethodId = await retrievePaymentMethod({
      paymentIntentId,
      secretKey,
      fetchImpl
    })
    const recurringPrices = await createRecurringPrices({
      order,
      configuration,
      secretKey,
      fetchImpl
    })
    const schedule = await requestStripe({
      path: '/subscription_schedules',
      method: 'POST',
      parameters: buildScheduleParameters({
        order,
        customerId,
        paymentMethodId,
        configuration,
        recurringPrices
      }),
      secretKey,
      idempotencyKey: `${order.id}:subscription-schedule`,
      fetchImpl
    })

    if (!schedule.id) {
      throw new StripeApiError(
        'Stripe n’a pas renvoyé l’échéancier attendu.',
        502,
        'STRIPE_INVALID_RESPONSE'
      )
    }

    const scheduledOrder = {
      ...order,
      status: 'scheduled',
      paymentStatus: 'paid',
      scheduleStatus: 'scheduled',
      customerId,
      paymentMethodId,
      initialPaymentIntentId: paymentIntentId,
      subscriptionScheduleId: schedule.id,
      subscriptionId: getId(schedule.subscription),
      recurringPrices,
      scheduleStartDate: configuration.firstDueDate,
      futureInstallmentCount: configuration.futureCount,
      scheduleCreatedAt: now(),
      updatedAt: now()
    }
    await orderRepository.saveOrder(scheduledOrder)

    return scheduledOrder
  } catch (error) {
    await orderRepository.saveOrder({
      ...order,
      status: 'schedule_failed',
      paymentStatus: 'paid',
      scheduleStatus: 'failed',
      customerId,
      initialPaymentIntentId: paymentIntentId,
      scheduleErrorCode: error.code ?? 'SCHEDULE_CREATION_FAILED',
      scheduleFailedAt: now(),
      updatedAt: now()
    })
    throw error
  }
}

export { buildScheduleParameters, getFuturePaymentConfiguration }
