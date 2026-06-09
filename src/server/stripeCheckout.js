import { createCartQuote } from './cartQuote.js'
import { randomUUID } from 'node:crypto'
import {
  requestStripe,
  StripeApiError
} from './stripeApi.js'

class StripeCheckoutError extends StripeApiError {}

function validateCheckoutItems(items) {
  const planIds = new Set(items.map((item) => item.planId))
  const countryCodes = new Set(items.map((item) => item.billingCountry))

  // Cette première version traite un seul rythme à la fois. Cela évite de créer
  // des abonnements mixtes avant d'avoir fixé les règles contractuelles.
  if (planIds.size !== 1) {
    throw new StripeCheckoutError(
      'Pour ce paiement test, toutes les inscriptions doivent utiliser la même formule.',
      409,
      'MIXED_BILLING_PLANS'
    )
  }

  if (countryCodes.size !== 1) {
    throw new StripeCheckoutError(
      'Toutes les inscriptions d’un même paiement doivent utiliser le même pays de facturation.',
      409,
      'MIXED_BILLING_COUNTRIES'
    )
  }
}

function buildItemDescription(item) {
  const options = item.selectedOptions
    .map((option) => `${option.label} : ${option.value}`)
    .join(' · ')

  return options || `Formule ${item.plan}`
}

function appendInitialPaymentLineItems(parameters, items) {
  items.forEach((item, index) => {
    const prefix = `line_items[${index}]`
    const firstPayment = item.paymentSchedule.firstPayment

    parameters.set(`${prefix}[quantity]`, '1')
    parameters.set(`${prefix}[price_data][currency]`, 'eur')
    parameters.set(
      `${prefix}[price_data][unit_amount]`,
      String(Math.round(firstPayment.subtotalExcludingTax * 100))
    )
    parameters.set(
      `${prefix}[price_data][product_data][name]`,
      `${item.curriculum} · ${item.grade} · premier paiement`
    )
    parameters.set(
      `${prefix}[price_data][product_data][description]`,
      `${firstPayment.periodLabel} · ${buildItemDescription(item)}`
    )
    parameters.set(
      `${prefix}[price_data][product_data][metadata][offer_id]`,
      item.offerId
    )
    parameters.set(
      `${prefix}[price_data][product_data][metadata][cart_item_id]`,
      item.cartItemId
    )
    parameters.set(
      `${prefix}[price_data][product_data][metadata][period_id]`,
      firstPayment.periodId
    )
  })
}

function buildCheckoutParameters(quote, siteUrl, orderId = 'order_preview') {
  validateCheckoutItems(quote.items)
  const parameters = new URLSearchParams()

  // Le premier paiement est toujours ponctuel. Les prélèvements suivants sont
  // créés seulement après sa confirmation, depuis le webhook sécurisé.
  parameters.set('mode', 'payment')
  parameters.set('locale', 'fr')
  parameters.set('payment_method_types[0]', 'card')
  parameters.set('automatic_tax[enabled]', 'false')
  parameters.set('billing_address_collection', 'required')
  parameters.set('phone_number_collection[enabled]', 'true')
  parameters.set('customer_creation', 'always')
  parameters.set('payment_intent_data[setup_future_usage]', 'off_session')
  parameters.set(
    'success_url',
    `${siteUrl}/#/paiement/succes?session_id={CHECKOUT_SESSION_ID}`
  )
  parameters.set('cancel_url', `${siteUrl}/#/paiement/annule`)
  parameters.set('metadata[source]', 'academie_salsabil_guest_cart')
  parameters.set('metadata[order_id]', orderId)
  parameters.set('metadata[item_count]', String(quote.itemCount))
  parameters.set('metadata[plan_id]', quote.items[0].planId)
  parameters.set(
    'metadata[future_installment_count]',
    String(quote.items[0].paymentSchedule.futurePayments.length)
  )
  parameters.set('client_reference_id', orderId)
  parameters.set('payment_intent_data[metadata][order_id]', orderId)
  parameters.set(
    'payment_intent_data[metadata][source]',
    'academie_salsabil_guest_cart'
  )
  parameters.set(
    'custom_text[submit][message]',
    'En validant, vous autorisez l’enregistrement du moyen de paiement et les prélèvements futurs indiqués dans votre échéancier.'
  )

  appendInitialPaymentLineItems(parameters, quote.items)

  return { mode: 'payment', parameters }
}

// Recalcule le panier puis crée une page Checkout hébergée par Stripe.
// La commande locale est créée avec un identifiant opaque avant l'appel Stripe,
// puis enregistrée uniquement lorsque Stripe a bien renvoyé une session.
export async function createStripeCheckoutSession({
  payload,
  secretKey,
  siteUrl,
  orderRepository,
  orderIdGenerator = () => `ord_${randomUUID()}`,
  now = () => new Date().toISOString(),
  fetchImpl = fetch
}) {
  if (!orderRepository) {
    throw new StripeCheckoutError(
      'Le stockage des commandes n’est pas configuré.',
      503,
      'ORDER_STORE_NOT_CONFIGURED'
    )
  }

  const quote = createCartQuote(payload)
  const orderId = orderIdGenerator()
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '')
  const { mode, parameters } = buildCheckoutParameters(
    quote,
    normalizedSiteUrl,
    orderId
  )
  const stripePayload = await requestStripe({
    path: '/checkout/sessions',
    method: 'POST',
    parameters,
    secretKey,
    fetchImpl
  })

  if (!stripePayload.url || !stripePayload.id) {
    throw new StripeCheckoutError(
      'La réponse de Stripe est incomplète.',
      502,
      'STRIPE_INVALID_RESPONSE'
    )
  }

  const timestamp = now()
  const order = {
    id: orderId,
    status: 'checkout_created',
    paymentStatus: 'unpaid',
    checkoutSessionId: stripePayload.id,
    stripeMode: mode,
    customerId: null,
    subscriptionId: null,
    currency: 'eur',
    itemCount: quote.itemCount,
    items: quote.items,
    groupedTotals: quote.groupedTotals,
    paymentSummary: quote.paymentSummary,
    scheduleStatus: quote.items.some(
      (item) => item.paymentSchedule.futurePayments.length > 0
    )
      ? 'awaiting_initial_payment'
      : 'not_required',
    createdAt: timestamp,
    updatedAt: timestamp
  }

  await orderRepository.saveOrder(order)

  return {
    checkoutReady: true,
    testMode: true,
    sessionId: stripePayload.id,
    orderId,
    checkoutUrl: stripePayload.url,
    mode,
    itemCount: quote.itemCount,
    groupedTotals: quote.groupedTotals
  }
}

export { StripeCheckoutError, buildCheckoutParameters }
