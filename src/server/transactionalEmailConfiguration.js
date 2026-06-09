import {
  createBrevoEmailProvider
} from './brevoEmailProvider.js'
import {
  createTransactionalEmailService,
  TransactionalEmailError
} from './transactionalEmailService.js'

function parseRecipientList(value) {
  return String(value ?? '')
    .split(',')
    .map((recipient) => recipient.trim())
    .filter(Boolean)
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())
}

// Cette fabrique concentre toutes les variables d'environnement. En mode
// disabled, aucune clé ni adresse n'est nécessaire et aucun client n'est créé.
export function createConfiguredTransactionalEmailService({
  environment = process.env,
  fetchImpl = globalThis.fetch,
  logger = console
} = {}) {
  const mode = environment.TRANSACTIONAL_EMAIL_MODE ?? 'disabled'

  if (mode === 'disabled') {
    return createTransactionalEmailService({ mode, logger })
  }

  if (mode !== 'provider') {
    throw new TransactionalEmailError(
      'Le mode configuré ne permet pas l’envoi transactionnel.',
      'INVALID_CONFIGURED_EMAIL_MODE'
    )
  }

  if (environment.TRANSACTIONAL_EMAIL_PROVIDER !== 'brevo') {
    throw new TransactionalEmailError(
      'Le fournisseur transactionnel configuré n’est pas pris en charge.',
      'EMAIL_PROVIDER_NOT_SUPPORTED'
    )
  }

  const internalRecipient =
    environment.TRANSACTIONAL_EMAIL_INTERNAL_RECIPIENT ?? ''
  const deliveryMode =
    environment.TRANSACTIONAL_EMAIL_DELIVERY_MODE ?? 'test'
  const allowedRecipients = parseRecipientList(
    environment.TRANSACTIONAL_EMAIL_TEST_RECIPIENTS
  )

  if (!isValidEmail(internalRecipient)) {
    throw new TransactionalEmailError(
      'Le destinataire interne des notifications est invalide.',
      'INVALID_INTERNAL_EMAIL_RECIPIENT'
    )
  }

  if (
    deliveryMode === 'test'
    && !allowedRecipients
      .map((recipient) => recipient.toLowerCase())
      .includes(internalRecipient.toLowerCase())
  ) {
    throw new TransactionalEmailError(
      'Le destinataire interne doit figurer dans la liste de test.',
      'INTERNAL_RECIPIENT_NOT_ALLOWED_IN_TEST'
    )
  }

  const provider = createBrevoEmailProvider({
    apiKey: environment.BREVO_API_KEY,
    senderEmail: environment.TRANSACTIONAL_EMAIL_SENDER_EMAIL,
    senderName: environment.TRANSACTIONAL_EMAIL_SENDER_NAME,
    replyToEmail: environment.TRANSACTIONAL_EMAIL_REPLY_TO_EMAIL,
    replyToName: environment.TRANSACTIONAL_EMAIL_REPLY_TO_NAME,
    deliveryMode,
    allowedRecipients,
    timeoutMilliseconds: Number(
      environment.TRANSACTIONAL_EMAIL_TIMEOUT_MS ?? 10_000
    ),
    fetchImpl
  })

  return createTransactionalEmailService({
    mode: 'provider',
    provider,
    internalRecipient,
    logger
  })
}
