const BREVO_EMAIL_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'
const DEFAULT_TIMEOUT_MILLISECONDS = 10_000
const TRANSIENT_HTTP_STATUSES = new Set([408, 409, 425, 429])

class BrevoEmailError extends Error {
  constructor(message, {
    code = 'BREVO_EMAIL_ERROR',
    retryable = false,
    status = null
  } = {}) {
    super(message)
    this.name = 'BrevoEmailError'
    this.code = code
    this.retryable = retryable
    this.status = status
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeAllowedRecipients(recipients) {
  return new Set(
    recipients
      .map(normalizeEmail)
      .filter(Boolean)
  )
}

function isTransientStatus(status) {
  return TRANSIENT_HTTP_STATUSES.has(status) || status >= 500
}

async function readJsonResponse(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function createBrevoPayload(message, config) {
  return {
    sender: {
      email: config.senderEmail,
      name: config.senderName
    },
    replyTo: {
      email: config.replyToEmail,
      name: config.replyToName
    },
    to: [{ email: message.to }],
    subject: message.subject,
    htmlContent: message.html,
    textContent: message.text,
    // Brevo accepte cette clé comme en-tête personnalisé. Notre reçu serveur
    // reste la garantie principale si le fournisseur ne la traite pas.
    headers: {
      'Idempotency-Key': message.idempotencyKey
    },
    tags: [
      message.tags?.templateId,
      message.tags?.audience
    ].filter(Boolean)
  }
}

// Cet adaptateur est le seul fichier qui connaît le contrat HTTP de Brevo.
// Le service transactionnel continue de dépendre uniquement de send(message).
export function createBrevoEmailProvider({
  apiKey,
  senderEmail,
  senderName,
  replyToEmail,
  replyToName,
  deliveryMode = 'test',
  allowedRecipients = [],
  timeoutMilliseconds = DEFAULT_TIMEOUT_MILLISECONDS,
  fetchImpl = globalThis.fetch
}) {
  if (!apiKey || !fetchImpl) {
    throw new BrevoEmailError(
      'La configuration technique Brevo est incomplète.',
      { code: 'BREVO_NOT_CONFIGURED' }
    )
  }

  if (
    !isValidEmail(senderEmail)
    || !isValidEmail(replyToEmail)
    || !String(senderName ?? '').trim()
    || !String(replyToName ?? '').trim()
  ) {
    throw new BrevoEmailError(
      'Les adresses d’expédition ou de réponse Brevo sont invalides.',
      { code: 'BREVO_INVALID_SENDER_CONFIGURATION' }
    )
  }

  if (!['test', 'live'].includes(deliveryMode)) {
    throw new BrevoEmailError(
      'Le mode de livraison Brevo est invalide.',
      { code: 'BREVO_INVALID_DELIVERY_MODE' }
    )
  }

  if (
    !Number.isFinite(timeoutMilliseconds)
    || timeoutMilliseconds < 100
    || timeoutMilliseconds > 60_000
  ) {
    throw new BrevoEmailError(
      'Le délai d’attente Brevo doit être compris entre 100 et 60 000 ms.',
      { code: 'BREVO_INVALID_TIMEOUT' }
    )
  }

  const normalizedAllowedRecipients =
    normalizeAllowedRecipients(allowedRecipients)

  if (
    normalizedAllowedRecipients.size !== allowedRecipients.length
    || [...normalizedAllowedRecipients].some(
      (recipient) => !isValidEmail(recipient)
    )
  ) {
    throw new BrevoEmailError(
      'La liste des destinataires de test contient une adresse invalide.',
      { code: 'BREVO_INVALID_TEST_ALLOWLIST' }
    )
  }

  if (deliveryMode === 'test' && normalizedAllowedRecipients.size === 0) {
    throw new BrevoEmailError(
      'Le mode test Brevo exige au moins un destinataire autorisé.',
      { code: 'BREVO_TEST_ALLOWLIST_REQUIRED' }
    )
  }

  const config = {
    senderEmail: normalizeEmail(senderEmail),
    senderName: String(senderName).trim(),
    replyToEmail: normalizeEmail(replyToEmail),
    replyToName: String(replyToName).trim()
  }

  return {
    async send(message) {
      const recipient = normalizeEmail(message?.to)

      if (!isValidEmail(recipient)) {
        throw new BrevoEmailError(
          'Le destinataire de l’e-mail est invalide.',
          { code: 'BREVO_INVALID_RECIPIENT' }
        )
      }

      if (
        deliveryMode === 'test'
        && !normalizedAllowedRecipients.has(recipient)
      ) {
        throw new BrevoEmailError(
          'Le destinataire n’est pas autorisé en mode test.',
          { code: 'BREVO_RECIPIENT_NOT_ALLOWED' }
        )
      }

      if (
        !message.subject
        || !message.html
        || !message.text
        || !message.idempotencyKey
      ) {
        throw new BrevoEmailError(
          'Le message transactionnel est incomplet.',
          { code: 'BREVO_INVALID_MESSAGE' }
        )
      }

      const controller = new AbortController()
      const timeout = setTimeout(
        () => controller.abort(),
        timeoutMilliseconds
      )

      try {
        const response = await fetchImpl(BREVO_EMAIL_ENDPOINT, {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify(createBrevoPayload({
            ...message,
            to: recipient
          }, config)),
          signal: controller.signal
        })
        const body = await readJsonResponse(response)

        if (!response.ok) {
          const retryable = isTransientStatus(response.status)
          throw new BrevoEmailError(
            retryable
              ? 'Brevo est temporairement indisponible.'
              : 'Brevo a refusé le message.',
            {
              code: retryable
                ? 'BREVO_TEMPORARY_ERROR'
                : 'BREVO_PERMANENT_ERROR',
              retryable,
              status: response.status
            }
          )
        }

        if (response.status !== 201 || !body?.messageId) {
          throw new BrevoEmailError(
            'Brevo a renvoyé une confirmation invalide.',
            {
              code: 'BREVO_INVALID_RESPONSE',
              // Une nouvelle tentative est sûre grâce à la clé d’idempotence.
              retryable: true,
              status: response.status
            }
          )
        }

        return { id: body.messageId }
      } catch (error) {
        if (error instanceof BrevoEmailError) throw error

        if (error?.name === 'AbortError') {
          throw new BrevoEmailError(
            'Brevo n’a pas répondu dans le délai attendu.',
            { code: 'BREVO_TIMEOUT', retryable: true }
          )
        }

        throw new BrevoEmailError(
          'La connexion à Brevo a échoué.',
          { code: 'BREVO_NETWORK_ERROR', retryable: true }
        )
      } finally {
        clearTimeout(timeout)
      }
    }
  }
}

export { BrevoEmailError }
