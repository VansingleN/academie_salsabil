import { readAdminJsonResponse } from './adminApiError'

const ADMIN_ORDERS_ENDPOINT = `${import.meta.env.BASE_URL}api/admin-orders`

export async function getAdministrativeOrders(adminKey, filters) {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [key, String(value)])
    )
  )
  const response = await fetch(`${ADMIN_ORDERS_ENDPOINT}?${params}`, {
    headers: {
      Authorization: `Bearer ${adminKey}`
    }
  })

  return readAdminJsonResponse(
    response,
    'Les commandes ne peuvent pas être chargées.'
  )
}
