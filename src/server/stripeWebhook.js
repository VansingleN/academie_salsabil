import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  ensureStripeSubscriptionSchedule
} from './stripeSubscriptionSchedule.js'

const DEFAULT_TOLERANCE_SECONDS = 300
const SUPPORTED_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.expired',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.deleted'
])

class StripeWebhookError extends Error {
  constructor(message, status = 400, code = 'WEBHOOK_ERROR') {
    super(message)
    this.name = 'StripeWebhookError'
    this.status = status
    this.code = code
  }
}

function parseSignatureHeader(header) {
  const values = { timestamp: null, signatures: [] }

  for (const part of header.split(',')) {
    const [key, value] = part.split('=')

    if (key === 't') values.timestamp = Number(value)
    if (key === 'v1' && value) values.signatures.push(value)
  }

  return values
}

function signaturesMatch(expected, candidate) {
  const expectedBuffer = Buffer.from(expected, 'hex')
  const candidateBuffer = Buffer.from(candidate, 'hex')

  return expectedBuffer.length === candidateBuffer.length
    && timingSafeEqual(expectedBuffer, candidateBuffer)
}

// Le JSON n'est analysé qu'après vérification HMAC. Stripe signe le corps brut :
// le reformater avant ce contrôle invaliderait la preuve d'authenticité.
export function verifyStripeWebhook({
  rawBody,
  signatureHeader,
  webhookSecret,
  nowSeconds = () => Math.floor(Date.now() / 1000),
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS
}) {
  if (!webhookSecret) {
    throw new StripeWebhookError(
      'Le secret du webhook Stripe n’est pas configuré.',
      503,
      'WEBHOOK_NOT_CONFIGURED'
    )
  }

  if (!signatureHeader) {
    throw new StripeWebhookError(
      'La signature Stripe est absente.',
      400,
      'MISSING_STRIPE_SIGNATURE'
    )
  }

  const { timestamp, signatures } = parseSignatureHeader(signatureHeader)

  if (!Number.isFinite(timestamp) || signatures.length === 0) {
    throw new StripeWebhookError(
      'La signature Stripe est invalide.',
      400,
      'INVALID_STRIPE_SIGNATURE'
    )
  }

  if (Math.abs(nowSeconds() - timestamp) > toleranceSeconds) {
    throw new StripeWebhookError(
      'La signature Stripe a expiré.',
      400,
      'EXPIRED_STRIPE_SIGNATURE'
    )
  }

  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest('hex')

  if (!signatures.some((signature) => signaturesMatch(expectedSignature, signature))) {
    throw new StripeWebhookError(
      'La signature Stripe ne correspond pas au contenu reçu.',
      400,
      'INVALID_STRIPE_SIGNATURE'
    )
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    throw new StripeWebhookError(
      'Le contenu du webhook Stripe est invalide.',
      400,
      'INVALID_WEBHOOK_JSON'
    )
  }
}

function getId(value) {
  return typeof value === 'string' ? value : value?.id ?? null
}

function getInvoiceSubscriptionId(invoice) {
  return getId(invoice.subscription)
    ?? getId(invoice.parent?.subscription_details?.subscription)
}

function getOrderIdFromObject(object) {
  return object.metadata?.order_id
    ?? object.parent?.subscription_details?.metadata?.order_id
    ?? object.subscription_details?.metadata?.order_id
    ?? null
}

async function findEventOrder(event, repository) {
  const object = event.data?.object ?? {}
  const orderId = getOrderIdFromObject(object)

  if (orderId) {
    return repository.getOrder(orderId)
  }

  if (event.type.startsWith('checkout.session.')) {
    return repository.findOrderByCheckoutSession(object.id)
  }

  const subscriptionId = event.type.startsWith('invoice.')
    ? getInvoiceSubscriptionId(object)
    : getId(object)

  return subscriptionId
    ? repository.findOrderBySubscription(subscriptionId)
    : null
}

function appendEventHistory(order, event, processedAt) {
  const history = Array.isArray(order.eventHistory) ? order.eventHistory : []

  return [
    ...history,
    { id: event.id, type: event.type, processedAt }
  ].slice(-20)
}

function applyEventToOrder(order, event, processedAt) {
  const object = event.data.object
  const nextOrder = {
    ...order,
    updatedAt: processedAt,
    lastStripeEventId: event.id,
    eventHistory: appendEventHistory(order, event, processedAt)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const isPaid = object.payment_status === 'paid'
      const hasFuturePayments = order.items?.some(
        (item) => item.paymentSchedule?.futurePayments?.length > 0
      )

      return {
        ...nextOrder,
        status: isPaid
          ? (hasFuturePayments ? 'initial_payment_paid' : 'paid')
          : 'checkout_completed',
        paymentStatus: object.payment_status ?? order.paymentStatus,
        checkoutSessionId: object.id,
        customerId: getId(object.customer),
        subscriptionId: getId(object.subscription),
        customerEmail: object.customer_details?.email ?? order.customerEmail ?? null,
        checkoutCompletedAt: processedAt
      }
    }

    case 'checkout.session.expired':
      return {
        ...nextOrder,
        status: 'expired',
        paymentStatus: object.payment_status ?? 'unpaid',
        checkoutExpiredAt: processedAt
      }

    case 'invoice.paid':
      return {
        ...nextOrder,
        status: 'active',
        paymentStatus: 'paid',
        customerId: getId(object.customer) ?? order.customerId,
        subscriptionId: getInvoiceSubscriptionId(object) ?? order.subscriptionId,
        lastInvoiceId: object.id,
        lastPaymentAt: processedAt
      }

    case 'invoice.payment_failed':
      return {
        ...nextOrder,
        status: 'past_due',
        paymentStatus: 'failed',
        customerId: getId(object.customer) ?? order.customerId,
        subscriptionId: getInvoiceSubscriptionId(object) ?? order.subscriptionId,
        lastInvoiceId: object.id,
        lastPaymentFailureAt: processedAt
      }

    case 'customer.subscription.deleted':
      return {
        ...nextOrder,
        status: 'cancelled',
        subscriptionId: object.id,
        subscriptionCancelledAt: processedAt
      }

    default:
      return nextOrder
  }
}

// L'identifiant unique de l'événement Stripe empêche de retraiter un envoi.
// Les mises à jour sont elles-mêmes répétables, ce qui protège aussi le cas rare
// où une exécution s'arrête entre la sauvegarde de la commande et celle du reçu.
export async function processStripeEvent({
  event,
  orderRepository,
  secretKey,
  fetchImpl = fetch,
  scheduleProvisioner = ensureStripeSubscriptionSchedule,
  now = () => new Date().toISOString()
}) {
  if (!event?.id || !event?.type || !event?.data?.object) {
    throw new StripeWebhookError(
      'La structure de l’événement Stripe est invalide.',
      400,
      'INVALID_STRIPE_EVENT'
    )
  }

  const previousReceipt = await orderRepository.getProcessedEvent(event.id)

  if (previousReceipt) {
    return {
      received: true,
      duplicate: true,
      eventId: event.id,
      orderId: previousReceipt.orderId ?? null
    }
  }

  const processedAt = now()
  const supported = SUPPORTED_EVENTS.has(event.type)
  const order = supported
    ? await findEventOrder(event, orderRepository)
    : null

  // Ne pas enregistrer de reçu tant que la commande liée n'est pas visible :
  // une réponse temporairement en erreur demande à Stripe de renvoyer l'événement.
  if (supported && !order) {
    throw new StripeWebhookError(
      'La commande liée à cet événement n’est pas encore disponible.',
      503,
      'WEBHOOK_ORDER_NOT_READY'
    )
  }

  let updatedOrder = order
    ? applyEventToOrder(order, event, processedAt)
    : null

  if (updatedOrder) {
    await orderRepository.saveOrder(updatedOrder)
  }

  // Le paiement initial est confirmé avant toute création récurrente. Si Stripe
  // refuse le schedule, l'événement reste sans reçu afin d'être retenté.
  if (
    event.type === 'checkout.session.completed'
    && updatedOrder?.paymentStatus === 'paid'
  ) {
    updatedOrder = await scheduleProvisioner({
      order: updatedOrder,
      checkoutSession: event.data.object,
      secretKey,
      orderRepository,
      fetchImpl,
      now
    })
  }

  const receipt = {
    id: event.id,
    type: event.type,
    supported,
    orderId: updatedOrder?.id ?? null,
    processedAt
  }
  await orderRepository.saveProcessedEvent(receipt)

  return {
    received: true,
    duplicate: false,
    supported,
    eventId: event.id,
    orderId: receipt.orderId
  }
}

export { StripeWebhookError }
