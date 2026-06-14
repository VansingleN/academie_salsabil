export class AdminApiError extends Error {
  constructor(message, status, code = null) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.code = code
  }
}

export async function readAdminJsonResponse(
  response,
  fallbackMessage = 'L’opération a échoué.'
) {
  let payload
  try {
    payload = await response.json()
  } catch {
    throw new AdminApiError(
      'La réponse du serveur est illisible.',
      response.status
    )
  }
  if (!response.ok) {
    throw new AdminApiError(
      payload.message ?? fallbackMessage,
      response.status,
      payload.code
    )
  }
  return payload
}
