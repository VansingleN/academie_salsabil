import { createHash } from 'node:crypto'

export const FORM_MINIMUM_COMPLETION_MILLISECONDS = 1500
export const FORM_RATE_LIMIT_WINDOW_MILLISECONDS = 15 * 60 * 1000
export const FORM_RATE_LIMIT_MAX_ATTEMPTS = 8

export class FormSubmissionProtectionError extends Error {
  constructor(code, message, status = 429) {
    super(message)
    this.name = 'FormSubmissionProtectionError'
    this.code = code
    this.status = status
  }
}

export function getRequestClientAddress(request) {
  const netlifyAddress = request.headers.get('x-nf-client-connection-ip')
  if (netlifyAddress) return netlifyAddress.trim()

  const forwardedAddress = request.headers.get('x-forwarded-for')
  return forwardedAddress?.split(',')[0]?.trim() ?? ''
}

function createClientHash(clientAddress) {
  return createHash('sha256').update(clientAddress).digest('hex')
}

export async function checkFormSubmissionProtection(
  {
    formStartedAt,
    clientAddress
  },
  {
    repository,
    now = new Date(),
    minimumCompletionMilliseconds = FORM_MINIMUM_COMPLETION_MILLISECONDS,
    windowMilliseconds = FORM_RATE_LIMIT_WINDOW_MILLISECONDS,
    maximumAttempts = FORM_RATE_LIMIT_MAX_ATTEMPTS,
    randomId = globalThis.crypto.randomUUID()
  } = {}
) {
  const startedAt = new Date(formStartedAt).getTime()
  const nowMilliseconds = now.getTime()

  if (
    !Number.isFinite(startedAt)
    || startedAt > nowMilliseconds
    || nowMilliseconds - startedAt < minimumCompletionMilliseconds
  ) {
    throw new FormSubmissionProtectionError(
      'FORM_SUBMITTED_TOO_QUICKLY',
      'Le formulaire a été envoyé trop rapidement. Patientez un instant puis réessayez.',
      422
    )
  }

  // Netlify fournit normalement l'adresse du client. Si elle manque dans un
  // environnement local ou intermédiaire, le délai et le honeypot restent
  // actifs sans appliquer un quota global à tous les visiteurs.
  if (!clientAddress || !repository?.countAttempts || !repository?.saveAttempt) {
    return { allowed: true, rateLimitApplied: false }
  }

  const clientHash = createClientHash(clientAddress)
  const windowStartedAt =
    Math.floor(nowMilliseconds / windowMilliseconds) * windowMilliseconds
  const windowId = new Date(windowStartedAt).toISOString()
  const attempts = await repository.countAttempts(clientHash, windowId)

  if (attempts >= maximumAttempts) {
    throw new FormSubmissionProtectionError(
      'FORM_RATE_LIMITED',
      'Trop de tentatives ont été effectuées. Patientez quelques minutes avant de réessayer.',
      429
    )
  }

  await repository.saveAttempt({
    clientHash,
    windowId,
    attemptId: randomId,
    createdAt: now.toISOString()
  })

  return {
    allowed: true,
    rateLimitApplied: true,
    remainingAttempts: Math.max(0, maximumAttempts - attempts - 1)
  }
}
