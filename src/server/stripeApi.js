const STRIPE_API_URL = 'https://api.stripe.com/v1'

class StripeApiError extends Error {
  constructor(message, status = 502, code = 'STRIPE_API_ERROR') {
    super(message)
    this.name = 'StripeApiError'
    this.status = status
    this.code = code
  }
}

// Le mode live reste volontairement bloqué tant que tout le parcours de test
// et les règles commerciales n'ont pas été validés.
export function assertStripeTestKey(secretKey) {
  if (!secretKey) {
    throw new StripeApiError(
      'La clé Stripe n’est pas configurée sur le serveur.',
      503,
      'STRIPE_NOT_CONFIGURED'
    )
  }

  if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('rk_test_')) {
    throw new StripeApiError(
      'Stripe est limité au mode test pour le moment.',
      503,
      'STRIPE_TEST_MODE_REQUIRED'
    )
  }
}

// Tous les appels Stripe passent par ce point afin de conserver les mêmes
// contrôles, messages d'erreur et possibilités de tests sans réseau.
export async function requestStripe({
  path,
  secretKey,
  method = 'GET',
  parameters,
  idempotencyKey,
  fetchImpl = fetch
}) {
  assertStripeTestKey(secretKey)

  const response = await fetchImpl(`${STRIPE_API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...(parameters
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : {})
    },
    body: parameters
  })
  const payload = await response.json()

  if (!response.ok) {
    console.error('Stripe API error', payload?.error?.type)
    throw new StripeApiError(
      'Stripe n’a pas pu traiter la demande.',
      502,
      'STRIPE_API_ERROR'
    )
  }

  return payload
}

export { StripeApiError }
