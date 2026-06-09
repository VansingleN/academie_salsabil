import {
  processStripeEvent,
  StripeWebhookError,
  verifyStripeWebhook
} from '../../src/server/stripeWebhook.js'
import {
  createNetlifyBlobsOrderRepository
} from '../../src/server/orderRepository.js'
import {
  createConfiguredTransactionalEmailService
} from '../../src/server/transactionalEmailConfiguration.js'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

// Stripe exige le corps HTTP brut pour vérifier sa signature. Il ne faut donc
// jamais appeler request.json() avant verifyStripeWebhook().
export default async function stripeWebhook(request) {
  if (request.method !== 'POST') {
    return jsonResponse(
      { received: false, code: 'METHOD_NOT_ALLOWED', message: 'Méthode non autorisée.' },
      405
    )
  }

  try {
    const rawBody = await request.text()
    const event = verifyStripeWebhook({
      rawBody,
      signatureHeader: request.headers.get('stripe-signature'),
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    })
    const result = await processStripeEvent({
      event,
      orderRepository: createNetlifyBlobsOrderRepository(),
      secretKey: process.env.STRIPE_SECRET_KEY,
      notificationService: createConfiguredTransactionalEmailService()
    })

    return jsonResponse(result)
  } catch (error) {
    if (error instanceof StripeWebhookError) {
      return jsonResponse(
        { received: false, code: error.code, message: error.message },
        error.status
      )
    }

    console.error('Erreur du webhook Stripe', error)
    return jsonResponse(
      {
        received: false,
        code: 'SERVER_ERROR',
        message: 'L’événement Stripe ne peut pas être traité.'
      },
      500
    )
  }
}

export const config = {
  path: '/api/stripe-webhook'
}
