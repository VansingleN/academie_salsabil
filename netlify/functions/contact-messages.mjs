import {
  ContactMessageError,
  createContactMessage,
  listContactMessages,
  updateContactMessageStatus
} from '../../src/server/contactMessage.js'
import {
  createNetlifyBlobsContactMessageRepository
} from '../../src/server/contactMessageRepository.js'
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

export default async function contactMessagesHandler(request) {
  const repository = createNetlifyBlobsContactMessageRepository()

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
      const result = await createContactMessage(payload, {
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
      return jsonResponse({
        authenticated: true,
        ...listContactMessages(await repository.list(), {
          page: url.searchParams.get('page'),
          pageSize: url.searchParams.get('pageSize'),
          search: url.searchParams.get('search') ?? '',
          status: url.searchParams.get('status') ?? 'all',
          sort: url.searchParams.get('sort') ?? 'newest'
        })
      })
    }

    if (request.method === 'PATCH') {
      const message = await updateContactMessageStatus(await request.json(), {
        repository
      })
      return jsonResponse({ updated: true, message })
    }

    if (request.method === 'DELETE') {
      const messageId = new URL(request.url).searchParams.get('messageId')
      const deleted = messageId ? await repository.delete(messageId) : false
      return deleted
        ? jsonResponse({ deleted: true })
        : jsonResponse({ deleted: false, message: 'Ce message est introuvable.' }, 404)
    }

    return jsonResponse({ message: 'Méthode non autorisée.' }, 405)
  } catch (error) {
    if (
      error instanceof ContactMessageError
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
      return jsonResponse({ accepted: false, message: 'Le contenu est invalide.' }, 400)
    }

    console.error('Erreur lors du traitement du message de contact', error)
    return jsonResponse(
      {
        accepted: false,
        message: 'Le message ne peut pas être enregistré pour le moment.'
      },
      500
    )
  }
}

export const config = {
  path: '/api/contact-messages'
}
