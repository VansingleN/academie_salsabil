import {
  createSupportRequest,
  listSupportRequests,
  SupportRequestError,
  updateSupportRequestStatus
} from '../../src/server/supportRequest.js'
import {
  createNetlifyBlobsSupportRequestRepository
} from '../../src/server/supportRequestRepository.js'
import {
  checkFormSubmissionProtection,
  FormSubmissionProtectionError,
  getRequestClientAddress
} from '../../src/server/formSubmissionProtection.js'
import {
  createNetlifyBlobsFormSubmissionProtectionRepository
} from '../../src/server/formSubmissionProtectionRepository.js'
import {
  createConfiguredFormNotificationService
} from '../../src/server/formNotification.js'
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

export default async function createSupportRequestHandler(request) {
  const repository = createNetlifyBlobsSupportRequestRepository()

  try {
    if (request.method === 'POST') {
      const payload = await request.json()
      await checkFormSubmissionProtection(
        {
          formStartedAt: payload.formStartedAt,
          clientAddress: getRequestClientAddress(request)
        },
        {
          repository: createNetlifyBlobsFormSubmissionProtectionRepository()
        }
      )
      let notificationService
      try {
        notificationService = createConfiguredFormNotificationService()
      } catch (error) {
        console.error('Configuration de notification indisponible', error)
      }
      const result = await createSupportRequest(payload, {
        repository,
        notificationService
      })
      return jsonResponse(result, 201)
    }

    await authorizeAdminRequest(request, {
      repository: createNetlifyBlobsAdminAccessRepository()
    })

    if (request.method === 'GET') {
      const url = new URL(request.url)
      const result = listSupportRequests(await repository.list(), {
        page: url.searchParams.get('page'),
        pageSize: url.searchParams.get('pageSize'),
        search: url.searchParams.get('search') ?? '',
        status: url.searchParams.get('status') ?? 'all',
        sort: url.searchParams.get('sort') ?? 'newest'
      })

      return jsonResponse({
        authenticated: true,
        ...result
      })
    }

    if (request.method === 'PATCH') {
      const payload = await request.json()
      const updated = await updateSupportRequestStatus(payload, { repository })
      return jsonResponse({ updated: true, request: updated })
    }

    if (request.method === 'DELETE') {
      const requestId = new URL(request.url).searchParams.get('requestId')
      const deleted = requestId ? await repository.delete(requestId) : false

      if (!deleted) {
        return jsonResponse(
          {
            deleted: false,
            code: 'REQUEST_NOT_FOUND',
            message: 'Cette demande de soutien est introuvable.'
          },
          404
        )
      }

      return jsonResponse({ deleted: true })
    }

    return jsonResponse(
      {
        accepted: false,
        code: 'METHOD_NOT_ALLOWED',
        message: 'Méthode non autorisée.'
      },
      405
    )
  } catch (error) {
    if (
      error instanceof SupportRequestError
      || error instanceof FormSubmissionProtectionError
      || error instanceof AdminAccessError
    ) {
      const response = jsonResponse(
        { accepted: false, code: error.code, message: error.message },
        error.status
      )
      if (error.retryAfterSeconds) {
        response.headers.set('Retry-After', String(error.retryAfterSeconds))
      }
      return response
    }

    if (error instanceof SyntaxError) {
      return jsonResponse(
        {
          accepted: false,
          code: 'INVALID_JSON',
          message: 'Le contenu de la demande est invalide.'
        },
        400
      )
    }

    console.error('Erreur lors de la création de la demande de soutien', error)
    return jsonResponse(
      {
        accepted: false,
        code: 'SERVER_ERROR',
        message:
          'La demande ne peut pas être enregistrée pour le moment. Réessayez dans quelques instants.'
      },
      500
    )
  }
}

export const config = {
  path: '/api/support-requests'
}
