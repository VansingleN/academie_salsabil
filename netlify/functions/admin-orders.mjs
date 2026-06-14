import {
  listAdministrativeOrders,
  OrderAdministrationError
} from '../../src/server/orderAdministration.js'
import {
  createNetlifyBlobsOrderRepository
} from '../../src/server/orderRepository.js'
import {
  AdminAccessError,
  authorizeAdminRequest
} from '../../src/server/adminAccess.js'
import {
  createNetlifyBlobsAdminAccessRepository
} from '../../src/server/adminAccessRepository.js'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

export default async function adminOrders(request) {
  if (request.method !== 'GET') {
    return jsonResponse({ message: 'Méthode non autorisée.' }, 405)
  }
  try {
    await authorizeAdminRequest(request, {
      repository: createNetlifyBlobsAdminAccessRepository()
    })
    const url = new URL(request.url)
    const repository = createNetlifyBlobsOrderRepository()
    return jsonResponse({
      authenticated: true,
      ...listAdministrativeOrders(await repository.listOrders(), {
        page: url.searchParams.get('page'),
        pageSize: url.searchParams.get('pageSize'),
        search: url.searchParams.get('search') ?? '',
        status: url.searchParams.get('status') ?? 'all',
        sort: url.searchParams.get('sort') ?? 'newest'
      })
    })
  } catch (error) {
    if (error instanceof AdminAccessError) {
      const response = jsonResponse(
        { code: error.code, message: error.message },
        error.status
      )
      if (error.retryAfterSeconds) {
        response.headers.set('Retry-After', String(error.retryAfterSeconds))
      }
      return response
    }

    if (error instanceof OrderAdministrationError) {
      return jsonResponse(
        { code: error.code, message: error.message },
        error.status
      )
    }

    console.error('Erreur de consultation des commandes', error)
    return jsonResponse(
      { message: 'Les commandes ne peuvent pas être consultées actuellement.' },
      500
    )
  }
}

export const config = {
  path: '/api/admin-orders'
}
