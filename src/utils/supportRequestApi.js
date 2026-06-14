const SUPPORT_REQUEST_ENDPOINT = `${import.meta.env.BASE_URL}api/support-requests`

export async function submitSupportRequest(payload, { signal } = {}) {
  const response = await fetch(SUPPORT_REQUEST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal
  })

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('La réponse du serveur est illisible.')
  }

  if (!response.ok || !result.accepted) {
    throw new Error(
      result.message ?? 'La demande n’a pas pu être enregistrée.'
    )
  }

  return result
}
