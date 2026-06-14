import { requestStripe, StripeApiError } from './stripeApi.js'

function getId(value) {
  return typeof value === 'string' ? value : value?.id ?? null
}

function assertCheckoutSessionId(sessionId) {
  if (
    typeof sessionId !== 'string'
    || !/^cs_test_[A-Za-z0-9_]+$/.test(sessionId)
    || sessionId.length > 255
  ) {
    throw new StripeApiError(
      'L’identifiant de session Stripe est invalide.',
      400,
      'INVALID_CHECKOUT_SESSION'
    )
  }
}

export async function retrieveCheckoutSession({
  sessionId,
  secretKey,
  fetchImpl = fetch
}) {
  assertCheckoutSessionId(sessionId)

  return requestStripe({
    path: `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    secretKey,
    fetchImpl
  })
}

// La page de succès demande cette vérification au serveur. Le simple fait que
// le navigateur ait atteint l'URL de retour n'est jamais utilisé comme preuve.
export async function verifyCheckoutSession({
  sessionId,
  secretKey,
  orderRepository,
  portalEnabled = false,
  fetchImpl = fetch
}) {
  const session = await retrieveCheckoutSession({
    sessionId,
    secretKey,
    fetchImpl
  })
  const orderId = session.metadata?.order_id
  const order = orderId
    ? await orderRepository.getOrder(orderId)
    : await orderRepository.findOrderByCheckoutSession(session.id)
  const belongsToApplication =
    session.metadata?.source === 'academie_salsabil_guest_cart'

  if (!belongsToApplication || !order || order.checkoutSessionId !== session.id) {
    throw new StripeApiError(
      'Cette session Stripe ne correspond à aucune commande.',
      404,
      'ORDER_NOT_FOUND'
    )
  }

  // Seul l'état persistant alimenté par le webhook confirme la commande.
  // Les états Stripe sont tout de même renvoyés pour expliquer une attente.
  const confirmed = ['paid', 'scheduled', 'active'].includes(order.status)

  return {
    verified: true,
    confirmed,
    sessionId: session.id,
    sessionStatus: session.status,
    paymentStatus: session.payment_status,
    orderId: order.id,
    publicOrderNumber: order.publicOrderNumber,
    orderStatus: order.status,
    portalAvailable: Boolean(
      portalEnabled
      && getId(session.customer)
      && Boolean(order.subscriptionScheduleId || order.subscriptionId)
    )
  }
}

export async function createCustomerPortalSession({
  sessionId,
  secretKey,
  orderRepository,
  siteUrl,
  portalEnabled = false,
  fetchImpl = fetch
}) {
  if (!portalEnabled) {
    throw new StripeApiError(
      'Le portail client Stripe n’est pas encore activé.',
      503,
      'PORTAL_NOT_ENABLED'
    )
  }

  const session = await retrieveCheckoutSession({
    sessionId,
    secretKey,
    fetchImpl
  })
  const order = await orderRepository.findOrderByCheckoutSession(session.id)
  const customerId = getId(session.customer)

  // Le client Stripe n'est jamais accepté directement depuis le navigateur :
  // il est retrouvé via une session Checkout appartenant à notre commande.
  if (
    !order
    || session.metadata?.source !== 'academie_salsabil_guest_cart'
    || !customerId
  ) {
    throw new StripeApiError(
      'Le portail client ne peut pas être ouvert pour cette commande.',
      404,
      'PORTAL_CUSTOMER_NOT_FOUND'
    )
  }

  const parameters = new URLSearchParams()
  parameters.set('customer', customerId)
  parameters.set('return_url', `${siteUrl.replace(/\/+$/, '')}/panier`)

  const portal = await requestStripe({
    path: '/billing_portal/sessions',
    method: 'POST',
    parameters,
    secretKey,
    fetchImpl
  })

  if (!portal.url) {
    throw new StripeApiError(
      'La réponse du portail Stripe est incomplète.',
      502,
      'STRIPE_INVALID_RESPONSE'
    )
  }

  return { portalReady: true, portalUrl: portal.url }
}
