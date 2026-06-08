import {
  CartQuoteError,
  createCartQuote
} from '../../src/server/cartQuote.js'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

// Cette fonction ne reçoit jamais de prix : elle reconstruit le devis depuis offerId.
export default async function validateCart(request) {
  if (request.method !== 'POST') {
    return jsonResponse(
      { valid: false, code: 'METHOD_NOT_ALLOWED', message: 'Méthode non autorisée.' },
      405
    )
  }

  try {
    const payload = await request.json()
    return jsonResponse(createCartQuote(payload))
  } catch (error) {
    if (error instanceof CartQuoteError) {
      return jsonResponse(
        { valid: false, code: error.code, message: error.message },
        error.status
      )
    }

    if (error instanceof SyntaxError) {
      return jsonResponse(
        { valid: false, code: 'INVALID_JSON', message: 'Le contenu JSON est invalide.' },
        400
      )
    }

    console.error('Erreur de validation du panier', error)
    return jsonResponse(
      { valid: false, code: 'SERVER_ERROR', message: 'Le devis ne peut pas être calculé.' },
      500
    )
  }
}
