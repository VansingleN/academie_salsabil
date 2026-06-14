import { createHash, timingSafeEqual } from 'node:crypto'
import { getRequestClientAddress } from './formSubmissionProtection.js'

export const ADMIN_RATE_LIMIT_WINDOW_MILLISECONDS = 15 * 60 * 1000
export const ADMIN_RATE_LIMIT_MAX_FAILED_ATTEMPTS = 6

export class AdminAccessError extends Error {
  constructor(code, message, status, retryAfterSeconds = null) {
    super(message)
    this.name = 'AdminAccessError'
    this.code = code
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

function hash(value) {
  return createHash('sha256').update(value).digest()
}

function keysMatch(providedKey, configuredKey) {
  return timingSafeEqual(hash(providedKey), hash(configuredKey))
}

function readBearerToken(request) {
  const authorization = request.headers.get('authorization') ?? ''
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
}

export async function authorizeAdminRequest(
  request,
  {
    configuredKey = process.env.SUPPORT_REQUEST_ADMIN_KEY,
    repository,
    now = new Date(),
    windowMilliseconds = ADMIN_RATE_LIMIT_WINDOW_MILLISECONDS,
    maximumFailedAttempts = ADMIN_RATE_LIMIT_MAX_FAILED_ATTEMPTS,
    randomId = globalThis.crypto.randomUUID()
  } = {}
) {
  if (!configuredKey) {
    throw new AdminAccessError(
      'ADMIN_ACCESS_NOT_CONFIGURED',
      'L’accès administrateur n’est pas configuré.',
      503
    )
  }

  const providedKey = readBearerToken(request)
  if (keysMatch(providedKey, configuredKey)) {
    return { authenticated: true }
  }

  const clientAddress = getRequestClientAddress(request)
  if (!clientAddress || !repository) {
    throw new AdminAccessError(
      'UNAUTHORIZED',
      'Clé d’accès incorrecte.',
      401
    )
  }

  const nowMilliseconds = now.getTime()
  const windowStartedAt =
    Math.floor(nowMilliseconds / windowMilliseconds) * windowMilliseconds
  const windowId = new Date(windowStartedAt).toISOString()
  const clientHash = createHash('sha256').update(clientAddress).digest('hex')
  const failedAttempts = await repository.countFailedAttempts(
    clientHash,
    windowId
  )
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStartedAt + windowMilliseconds - nowMilliseconds) / 1000)
  )

  if (failedAttempts >= maximumFailedAttempts) {
    throw new AdminAccessError(
      'ADMIN_RATE_LIMITED',
      'Trop de tentatives ont été effectuées. Réessayez dans quelques minutes.',
      429,
      retryAfterSeconds
    )
  }

  await repository.saveFailedAttempt({
    clientHash,
    windowId,
    attemptId: randomId,
    createdAt: now.toISOString()
  })

  if (failedAttempts + 1 >= maximumFailedAttempts) {
    throw new AdminAccessError(
      'ADMIN_RATE_LIMITED',
      'Trop de tentatives ont été effectuées. Réessayez dans quelques minutes.',
      429,
      retryAfterSeconds
    )
  }

  throw new AdminAccessError(
    'UNAUTHORIZED',
    'Clé d’accès incorrecte.',
    401
  )
}
