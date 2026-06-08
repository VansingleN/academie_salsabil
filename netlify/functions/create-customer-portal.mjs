import { StripeApiError } from '../../src/server/stripeApi.js'
import {
  createCustomerPortalSession
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

export default async function createPortal(request) {
  if (request.method !== 'POST') {
    return jsonResponse(
      { portalReady: false, code: 'METHOD_NOT_ALLOWED', message: 'Méthode non autorisée.' },
      405
    )
  }

  try {
    const { sessionId } = await request.json()
    const siteUrl = process.env.URL ?? new URL(request.url).origin
    const portal = await createCustomerPortalSession({
      sessionId,
      secretKey: process.env.STRIPE_SECRET_KEY,
      orderRepository: createNetlifyBlobsOrderRepository(),
      siteUrl,
      portalEnabled: process.env.STRIPE_PORTAL_ENABLED === 'true'
    })

    return jsonResponse(portal)
  } catch (error) {
    if (error instanceof StripeApiError) {
      return jsonResponse(
        { portalReady: false, code: error.code, message: error.message },
        error.status
      )
    }

    console.error('Erreur du portail client Stripe', error)
    return jsonResponse(
      {
        portalReady: false,
        code: 'SERVER_ERROR',
        message: 'Le portail client ne peut pas être ouvert.'
      },
      500
    )
  }
}

export const config = {
  path: '/api/create-customer-portal'
}
