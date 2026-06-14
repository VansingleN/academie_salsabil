import {
  AdminAccessError,
  authorizeAdminRequest
} from '../../src/server/adminAccess.js'
import {
  createNetlifyBlobsAdminAccessRepository
} from '../../src/server/adminAccessRepository.js'
import {
  AdministrativeExportError,
  createAdministrativeExport
} from '../../src/server/administrativeExport.js'
import {
  createNetlifyBlobsContactMessageRepository
} from '../../src/server/contactMessageRepository.js'
import {
  createNetlifyBlobsOrderRepository
} from '../../src/server/orderRepository.js'
import {
  createNetlifyBlobsSupportRequestRepository
} from '../../src/server/supportRequestRepository.js'

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  })
}

export default async function adminExport(request) {
  if (request.method !== 'GET') {
    return jsonResponse({ message: 'Méthode non autorisée.' }, 405)
  }

  try {
    await authorizeAdminRequest(request, {
      repository: createNetlifyBlobsAdminAccessRepository()
    })

    const url = new URL(request.url)
    const section = url.searchParams.get('section') ?? ''
    const format = url.searchParams.get('format') ?? ''
    let records

    if (section === 'support') {
      records = await createNetlifyBlobsSupportRequestRepository().list()
    } else if (section === 'contact') {
      records = await createNetlifyBlobsContactMessageRepository().list()
    } else if (section === 'orders') {
      records = await createNetlifyBlobsOrderRepository().listOrders()
    } else {
      records = []
    }

    const exported = createAdministrativeExport({
      section,
      format,
      records
    })

    return new Response(exported.body, {
      status: 200,
      headers: {
        'Content-Type': exported.contentType,
        'Content-Disposition': `attachment; filename="${exported.filename}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  } catch (error) {
    if (
      error instanceof AdminAccessError
      || error instanceof AdministrativeExportError
    ) {
      return jsonResponse(
        { code: error.code, message: error.message },
        error.status,
        error.retryAfterSeconds
          ? { 'Retry-After': String(error.retryAfterSeconds) }
          : {}
      )
    }

    console.error('Erreur lors de l’export administratif', error)
    return jsonResponse(
      { message: 'L’export ne peut pas être créé actuellement.' },
      500
    )
  }
}

export const config = {
  path: '/api/admin-export'
}
