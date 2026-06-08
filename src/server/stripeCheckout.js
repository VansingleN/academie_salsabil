import { createCartQuote } from './cartQuote.js'
import { randomUUID } from 'node:crypto'
import {
  requestStripe,
  StripeApiError
} from './stripeApi.js'

class StripeCheckoutError extends StripeApiError {}

function getCheckoutMode(items) {
  const planIds = new Set(items.map((item) => item.planId))

  // Cette première version traite un seul rythme à la fois. Cela évite de créer
  // des abonnements mixtes avant d'avoir fixé les règles contractuelles.
  if (planIds.size !== 1) {
    throw new StripeCheckoutError(
      'Pour ce paiement test, toutes les inscriptions doivent utiliser la même formule.',
      409,
      'MIXED_BILLING_PLANS'
    )
  }

  return items[0].billingMode === 'subscription' ? 'subscription' : 'payment'
}

function buildItemDescription(item) {
  const options = item.selectedOptions
    .map((option) => `${option.label} : ${option.value}`)
    .join(' · ')

  return options || `Formule ${item.plan}`
}

function appendLineItems(parameters, items, mode) {
  items.forEach((item, index) => {
    const prefix = `line_items[${index}]`

    parameters.set(`${prefix}[quantity]`, '1')
    parameters.set(`${prefix}[price_data][currency]`, 'eur')
    parameters.set(`${prefix}[price_data][unit_amount]`, String(item.totalAmount * 100))
    parameters.set(
      `${prefix}[price_data][product_data][name]`,
      `${item.curriculum} · ${item.grade} · ${item.plan}`
    )
    parameters.set(
      `${prefix}[price_data][product_data][description]`,
      buildItemDescription(item)
    )
    parameters.set(
      `${prefix}[price_data][product_data][metadata][offer_id]`,
      item.offerId
    )
    parameters.set(
      `${prefix}[price_data][product_data][metadata][cart_item_id]`,
      item.cartItemId
    )

    if (mode === 'subscription') {
      parameters.set(
        `${prefix}[price_data][recurring][interval]`,
        item.interval
      )
      parameters.set(
        `${prefix}[price_data][recurring][interval_count]`,
        String(item.intervalCount)
      )
    }
  })
}

function buildCheckoutParameters(quote, siteUrl, orderId = 'order_preview') {
  const mode = getCheckoutMode(quote.items)
  const parameters = new URLSearchParams()

  parameters.set('mode', mode)
  parameters.set('locale', 'fr')
  parameters.set('billing_address_collection', 'required')
  parameters.set('phone_number_collection[enabled]', 'true')
  parameters.set(
    'success_url',
    `${siteUrl}/#/paiement/succes?session_id={CHECKOUT_SESSION_ID}`
  )
  parameters.set('cancel_url', `${siteUrl}/#/paiement/annule`)
  parameters.set('metadata[source]', 'academie_salsabil_guest_cart')
  parameters.set('metadata[order_id]', orderId)
  parameters.set('metadata[item_count]', String(quote.itemCount))
  parameters.set('metadata[plan_id]', quote.items[0].planId)
  parameters.set('client_reference_id', orderId)

  // Ces métadonnées suivent l'objet de paiement récurrent ou ponctuel. Elles
  // permettent de rattacher une facture reçue avant un autre webhook.
  if (mode === 'subscription') {
    parameters.set('subscription_data[metadata][order_id]', orderId)
    parameters.set(
      'subscription_data[metadata][source]',
      'academie_salsabil_guest_cart'
    )
  } else {
    parameters.set('payment_intent_data[metadata][order_id]', orderId)
    parameters.set(
      'payment_intent_data[metadata][source]',
      'academie_salsabil_guest_cart'
    )
  }

  // Le paiement annuel crée aussi un Customer Stripe afin de conserver une
  // référence client sans imposer de compte sur le site.
  if (mode === 'payment') {
    parameters.set('customer_creation', 'always')
  }

  appendLineItems(parameters, quote.items, mode)

  return { mode, parameters }
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
