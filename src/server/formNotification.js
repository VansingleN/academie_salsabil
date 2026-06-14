import { createBrevoEmailProvider } from './brevoEmailProvider.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())
}

function parseRecipientList(value) {
  return String(value ?? '')
    .split(',')
    .map((recipient) => recipient.trim())
    .filter(Boolean)
}

function buildSupportRequestMessage(request, recipient) {
  const subjects = request.request.subjects.length > 0
    ? request.request.subjects.join(', ')
    : 'À préciser'
  const text = [
    'Nouvelle demande de soutien scolaire',
    '',
    `Référence : ${request.reference}`,
    `Responsable : ${request.contact.parentName}`,
    `E-mail : ${request.contact.email}`,
    `Téléphone : ${request.contact.phone}`,
    `Élève : ${request.student.age} ans, ${request.student.level}`,
    `Matières : ${subjects}`,
    `Parcours : ${request.mode === 'slot' ? 'Demande de créneau' : 'Conseil'}`,
    '',
    `Besoin : ${request.request.objective}`,
    `Disponibilités : ${request.request.availability}`,
    '',
    'Consultez le tableau d’administration pour traiter cette demande.'
  ].join('\n')

  const html = `
    <h1>Nouvelle demande de soutien scolaire</h1>
    <p><strong>Référence :</strong> ${escapeHtml(request.reference)}</p>
    <p><strong>Responsable :</strong> ${escapeHtml(request.contact.parentName)}</p>
    <p><strong>E-mail :</strong> ${escapeHtml(request.contact.email)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(request.contact.phone)}</p>
    <p><strong>Élève :</strong> ${escapeHtml(request.student.age)} ans,
      ${escapeHtml(request.student.level)}</p>
    <p><strong>Matières :</strong> ${escapeHtml(subjects)}</p>
    <p><strong>Parcours :</strong>
      ${request.mode === 'slot' ? 'Demande de créneau' : 'Conseil'}</p>
    <h2>Besoin exprimé</h2>
    <p>${escapeHtml(request.request.objective)}</p>
    <h2>Disponibilités</h2>
    <p>${escapeHtml(request.request.availability)}</p>
    <p>Consultez le tableau d’administration pour traiter cette demande.</p>
  `.trim()

  return {
    to: recipient,
    subject: `Nouvelle demande de soutien · ${request.reference}`,
    text,
    html,
    idempotencyKey: `form:${request.id}:internal`,
    tags: {
      templateId: 'support_request_received',
      audience: 'internal'
    }
  }
}

function buildContactMessage(message, recipient) {
  const fullName = `${message.contact.firstname} ${message.contact.lastname}`
  const text = [
    'Nouveau message de contact',
    '',
    `Référence : ${message.reference}`,
    `Nom : ${fullName}`,
    `E-mail : ${message.contact.email}`,
    `Téléphone : ${message.contact.phone ?? 'Non renseigné'}`,
    '',
    message.message,
    '',
    'Consultez le tableau d’administration pour traiter ce message.'
  ].join('\n')

  const html = `
    <h1>Nouveau message de contact</h1>
    <p><strong>Référence :</strong> ${escapeHtml(message.reference)}</p>
    <p><strong>Nom :</strong> ${escapeHtml(fullName)}</p>
    <p><strong>E-mail :</strong> ${escapeHtml(message.contact.email)}</p>
    <p><strong>Téléphone :</strong>
      ${escapeHtml(message.contact.phone ?? 'Non renseigné')}</p>
    <h2>Message</h2>
    <p>${escapeHtml(message.message)}</p>
    <p>Consultez le tableau d’administration pour traiter ce message.</p>
  `.trim()

  return {
    to: recipient,
    subject: `Nouveau message de contact · ${message.reference}`,
    text,
    html,
    idempotencyKey: `form:${message.id}:internal`,
    tags: {
      templateId: 'contact_message_received',
      audience: 'internal'
    }
  }
}

export function createConfiguredFormNotificationService({
  environment = process.env,
  fetchImpl = globalThis.fetch
} = {}) {
  const mode = environment.FORM_NOTIFICATION_MODE ?? 'disabled'

  if (mode === 'disabled') {
    return {
      mode,
      async notifySupportRequest() {
        return { status: 'not-configured' }
      },
      async notifyContactMessage() {
        return { status: 'not-configured' }
      }
    }
  }

  if (mode !== 'provider') {
    throw new Error('Le mode de notification des formulaires est invalide.')
  }

  if (environment.TRANSACTIONAL_EMAIL_PROVIDER !== 'brevo') {
    throw new Error('Le fournisseur de notification configuré est invalide.')
  }

  const internalRecipient =
    environment.FORM_NOTIFICATION_INTERNAL_RECIPIENT
    || environment.TRANSACTIONAL_EMAIL_INTERNAL_RECIPIENT
    || ''

  if (!isValidEmail(internalRecipient)) {
    throw new Error('Le destinataire interne des formulaires est invalide.')
  }

  const provider = createBrevoEmailProvider({
    apiKey: environment.BREVO_API_KEY,
    senderEmail: environment.TRANSACTIONAL_EMAIL_SENDER_EMAIL,
    senderName: environment.TRANSACTIONAL_EMAIL_SENDER_NAME,
    replyToEmail: environment.TRANSACTIONAL_EMAIL_REPLY_TO_EMAIL,
    replyToName: environment.TRANSACTIONAL_EMAIL_REPLY_TO_NAME,
    deliveryMode:
      environment.TRANSACTIONAL_EMAIL_DELIVERY_MODE ?? 'test',
    allowedRecipients: parseRecipientList(
      environment.TRANSACTIONAL_EMAIL_TEST_RECIPIENTS
    ),
    timeoutMilliseconds: Number(
      environment.TRANSACTIONAL_EMAIL_TIMEOUT_MS ?? 10_000
    ),
    fetchImpl
  })

  return {
    mode,
    async notifySupportRequest(request) {
      const result = await provider.send(
        buildSupportRequestMessage(request, internalRecipient)
      )
      return { status: 'sent', providerMessageId: result.id }
    },
    async notifyContactMessage(message) {
      const result = await provider.send(
        buildContactMessage(message, internalRecipient)
      )
      return { status: 'sent', providerMessageId: result.id }
    }
  }
}

export async function recordFormNotification({
  record,
  repository,
  notificationService,
  method,
  now = new Date(),
  logger = console
}) {
  let notification

  try {
    const result = await notificationService[method](record)
    notification = {
      status: result.status,
      providerMessageId: result.providerMessageId ?? null,
      processedAt: now.toISOString()
    }
  } catch (error) {
    notification = {
      status: 'failed',
      errorCode: error.code ?? 'FORM_NOTIFICATION_ERROR',
      processedAt: now.toISOString()
    }
    logger.error?.('Échec de notification interne du formulaire', {
      reference: record.reference,
      errorCode: notification.errorCode
    })
  }

  const updated = { ...record, notification }
  const saved = await repository.update(updated)

  if (!saved) {
    logger.error?.('Échec de mise à jour du statut de notification', {
      reference: record.reference
    })
  }

  return saved ?? updated
}
