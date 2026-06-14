import { AdminApiError, readAdminJsonResponse } from './adminApiError'

const CONTACT_MESSAGES_ENDPOINT = `${import.meta.env.BASE_URL}api/contact-messages`

async function readResponse(response) {
  let payload
  try {
    payload = await response.json()
  } catch {
    throw new AdminApiError('La réponse du serveur est illisible.', response.status)
  }
  if (!response.ok) {
    throw new AdminApiError(
      payload.message ?? 'L’opération a échoué.',
      response.status,
      payload.code
    )
  }
  return payload
}

export async function submitContactMessage(message) {
  return readResponse(await fetch(CONTACT_MESSAGES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  }))
}

function adminHeaders(adminKey) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminKey}`
  }
}

export async function getContactMessages(adminKey, filters) {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [key, String(value)])
    )
  )
  return readAdminJsonResponse(await fetch(`${CONTACT_MESSAGES_ENDPOINT}?${params}`, {
    headers: adminHeaders(adminKey)
  }))
}

export async function changeContactMessageStatus(adminKey, messageId, status) {
  const payload = await readResponse(await fetch(CONTACT_MESSAGES_ENDPOINT, {
    method: 'PATCH',
    headers: adminHeaders(adminKey),
    body: JSON.stringify({ messageId, status })
  }))
  return payload.message
}

export async function removeContactMessage(adminKey, messageId) {
  return readResponse(await fetch(
    `${CONTACT_MESSAGES_ENDPOINT}?messageId=${encodeURIComponent(messageId)}`,
    {
      method: 'DELETE',
      headers: adminHeaders(adminKey)
    }
  ))
}
