import { StripeApiError } from '../../src/server/stripeApi.js'
import {
  verifyCheckoutSession
} from '../../src/server/stripeSession.js'
import {
  createNetlifyBlobsOrderRepository
} from '../../src/server/orderRepository.js'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

export default async function verifySession(request) {
  if (request.method !== 'POST') {
    return jsonResponse(
      { verified: false, code: 'METHOD_NOT_ALLOWED', message: 'Méthode non autorisée.' },
      405
    )
  }

  try {
    const { sessionId } = await request.json()
    const result = await verifyCheckoutSession({
      sessionId,
      secretKey: process.env.STRIPE_SECRET_KEY,
      orderRepository: createNetlifyBlobsOrderRepository(),
      portalEnabled: process.env.STRIPE_PORTAL_ENABLED === 'true'
    })

    return jsonResponse(result)
  } catch (error) {
    if (error instanceof StripeApiError) {
      return jsonResponse(
        { verified: false, code: error.code, message: error.message },
        error.status
      )
    }

    if (error instanceof SyntaxError) {
      return jsonResponse(
        { verified: false, code: 'INVALID_JSON', message: 'Le contenu JSON est invalide.' },
        400
      )
    }

    console.error('Erreur de vérification Stripe', error)
    return jsonResponse(
      {
        verified: false,
        code: 'SERVER_ERROR',
        message: 'La session de paiement ne peut pas être vérifiée.'
      },
      500
    )
  }
}

export const config = {
  path: '/api/verify-checkout-session'
}
