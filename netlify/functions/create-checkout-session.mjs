import { CartQuoteError } from '../../src/server/cartQuote.js'
import {
  createStripeCheckoutSession,
  StripeCheckoutError
} from '../../src/server/stripeCheckout.js'
import { StripeApiError } from '../../src/server/stripeApi.js'
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

// Le navigateur envoie le panier brut. Le devis est recalculé une seconde fois
// ici, juste avant l'appel Stripe, afin de ne jamais faire confiance au client.
export default async function createCheckoutSession(request) {
  if (request.method !== 'POST') {
    return jsonResponse(
      { checkoutReady: false, code: 'METHOD_NOT_ALLOWED', message: 'Méthode non autorisée.' },
      405
    )
  }

  try {
    const payload = await request.json()
    const siteUrl = process.env.URL ?? new URL(request.url).origin
    const checkout = await createStripeCheckoutSession({
      payload,
      secretKey: process.env.STRIPE_SECRET_KEY,
      siteUrl,
      orderRepository: createNetlifyBlobsOrderRepository()
    })

    return jsonResponse(checkout)
  } catch (error) {
    if (
      error instanceof CartQuoteError
      || error instanceof StripeCheckoutError
      || error instanceof StripeApiError
    ) {
      return jsonResponse(
        { checkoutReady: false, code: error.code, message: error.message },
        error.status
      )
    }

    if (error instanceof SyntaxError) {
      return jsonResponse(
        { checkoutReady: false, code: 'INVALID_JSON', message: 'Le contenu JSON est invalide.' },
        400
      )
    }

    console.error('Erreur de création Stripe Checkout', error)
    return jsonResponse(
      {
        checkoutReady: false,
        code: 'SERVER_ERROR',
        message: 'La page de paiement ne peut pas être préparée.'
      },
      500
    )
  }
}

export const config = {
  path: '/api/create-checkout-session'
}
