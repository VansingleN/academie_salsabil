const CHECKOUT_ENDPOINT = `${import.meta.env.BASE_URL}api/create-checkout-session`
const VERIFY_SESSION_ENDPOINT = `${import.meta.env.BASE_URL}api/verify-checkout-session`
const CUSTOMER_PORTAL_ENDPOINT = `${import.meta.env.BASE_URL}api/create-customer-portal`

async function readApiResponse(response, fallbackMessage) {
  let payload

  try {
    payload = await response.json()
  } catch {
    throw new Error(fallbackMessage)
  }

  if (!response.ok) {
    throw new Error(payload.message ?? fallbackMessage)
  }

  return payload
}

// Stripe reste entièrement côté serveur : le front reçoit seulement l'URL
// temporaire de la page Checkout hébergée.
export async function requestCheckoutSession(items, enrollment) {
  const response = await fetch(CHECKOUT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items, enrollment })
  })

  const payload = await readApiResponse(
    response,
    'La réponse du serveur de paiement est illisible.'
  )

  if (!payload.checkoutReady) {
    throw new Error(payload.message ?? 'La page de paiement n’a pas pu être créée.')
  }

  return payload
}

// La page de succès transmet seulement l'identifiant opaque de Stripe. Le
// serveur récupère lui-même la session et la commande avant de répondre.
export async function requestCheckoutVerification(sessionId) {
  const response = await fetch(VERIFY_SESSION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  })

  return readApiResponse(
    response,
    'La confirmation du paiement est momentanément indisponible.'
  )
}

export async function requestCustomerPortal(sessionId) {
  const response = await fetch(CUSTOMER_PORTAL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  })
  const payload = await readApiResponse(
    response,
    'Le portail client est momentanément indisponible.'
  )

  if (!payload.portalReady || !payload.portalUrl) {
    throw new Error('Le portail client ne peut pas être ouvert.')
  }

  return payload
}
