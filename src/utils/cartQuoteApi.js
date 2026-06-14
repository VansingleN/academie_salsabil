// BASE_URL vaut / par défaut et /academie_salsabil/ sur un build GitHub Pages dédié.
const CART_QUOTE_ENDPOINT = `${import.meta.env.BASE_URL}api/cart-quote`

// Le client transmet uniquement les références minimales conservées dans localStorage.
export async function requestCartQuote(items, { signal } = {}) {
  const response = await fetch(CART_QUOTE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items }),
    signal
  })

  let payload

  try {
    payload = await response.json()
  } catch {
    throw new Error('La réponse du serveur est illisible.')
  }

  if (!response.ok || !payload.valid) {
    throw new Error(payload.message ?? 'Le panier n’a pas pu être validé.')
  }

  return payload
}
