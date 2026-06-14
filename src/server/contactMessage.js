const ALLOWED_STATUSES = new Set(['new', 'contacted', 'closed'])
const ALLOWED_SORTS = new Set(['newest', 'oldest'])
import { recordFormNotification } from './formNotification.js'

export class ContactMessageError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'ContactMessageError'
    this.code = code
    this.status = status
  }
}

function cleanText(value, { required = false, maxLength = 200 } = {}) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (required && !text) {
    throw new ContactMessageError(
      'MISSING_FIELD',
      'Certains champs obligatoires sont manquants.'
    )
  }
  if (text.length > maxLength) {
    throw new ContactMessageError(
      'FIELD_TOO_LONG',
      'Une information saisie dépasse la longueur autorisée.'
    )
  }
  return text
}

function requireAllowed(value, allowed) {
  if (!allowed.has(value)) {
    throw new ContactMessageError(
      'INVALID_FIELD',
      'Une option sélectionnée n’est pas valide.'
    )
  }
  return value
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export async function createContactMessage(
  payload,
  {
    repository,
    notificationService = null,
    logger = console,
    now = new Date(),
    randomId = globalThis.crypto.randomUUID()
  } = {}
) {
  if (!repository?.save) {
    throw new Error('Le dépôt des messages de contact est indisponible.')
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ContactMessageError(
      'INVALID_PAYLOAD',
      'Le contenu du message est invalide.'
    )
  }
  if (cleanText(payload.website, { maxLength: 200 })) {
    throw new ContactMessageError(
      'SPAM_DETECTED',
      'Le message n’a pas pu être enregistré.',
      422
    )
  }

  const email = cleanText(payload.email, {
    required: true,
    maxLength: 254
  }).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ContactMessageError(
      'INVALID_EMAIL',
      'L’adresse e-mail indiquée n’est pas valide.'
    )
  }
  if (payload.consent !== true) {
    throw new ContactMessageError(
      'CONSENT_REQUIRED',
      'Votre accord est nécessaire pour transmettre ce message.'
    )
  }

  const id = `contact_${randomId}`
  const suffix = randomId.replaceAll('-', '').slice(0, 8).toUpperCase()
  const date = now.toISOString().slice(0, 10).replaceAll('-', '')
  const message = {
    id,
    reference: `CONTACT-${date}-${suffix}`,
    status: 'new',
    createdAt: now.toISOString(),
    contact: {
      firstname: cleanText(payload.firstname, { required: true, maxLength: 80 }),
      lastname: cleanText(payload.lastname, { required: true, maxLength: 80 }),
      email,
      phone: cleanText(payload.phone, { maxLength: 40 }) || null
    },
    message: cleanText(payload.message, { required: true, maxLength: 4000 }),
    consent: {
      contact: true,
      recordedAt: now.toISOString()
    },
    notification: { status: 'not-configured' }
  }

  await repository.save(message)
  if (notificationService?.notifyContactMessage && repository.update) {
    await recordFormNotification({
      record: message,
      repository,
      notificationService,
      method: 'notifyContactMessage',
      now,
      logger
    })
  }
  return {
    accepted: true,
    reference: message.reference,
    createdAt: message.createdAt
  }
}

export function listContactMessages(
  messages,
  { page = 1, pageSize = 10, search = '', status = 'all', sort = 'newest' } = {}
) {
  const size = Math.min(50, Math.max(1, Number.parseInt(pageSize, 10) || 10))
  const requestedPage = Math.max(1, Number.parseInt(page, 10) || 1)
  const query = cleanText(search, { maxLength: 120 })
  const selectedStatus =
    status === 'all' ? 'all' : requireAllowed(status, ALLOWED_STATUSES)
  const selectedSort = requireAllowed(sort, ALLOWED_SORTS)
  const needle = normalize(query)

  const filtered = messages
    .filter((item) => {
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false
      if (!needle) return true
      return normalize([
        item.reference,
        item.contact?.firstname,
        item.contact?.lastname,
        item.contact?.email,
        item.contact?.phone,
        item.message
      ].join(' ')).includes(needle)
    })
    .sort((left, right) => {
      const comparison = left.createdAt.localeCompare(right.createdAt)
      return selectedSort === 'oldest' ? comparison : -comparison
    })

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / size))
  const currentPage = Math.min(requestedPage, totalPages)
  const start = (currentPage - 1) * size

  return {
    messages: filtered.slice(start, start + size),
    pagination: {
      page: currentPage,
      pageSize: size,
      totalItems,
      totalPages,
      from: totalItems === 0 ? 0 : start + 1,
      to: Math.min(start + size, totalItems)
    }
  }
}

export async function updateContactMessageStatus(
  { messageId, status },
  { repository, now = new Date() } = {}
) {
  const id = cleanText(messageId, { required: true, maxLength: 100 })
  const selectedStatus = requireAllowed(status, ALLOWED_STATUSES)
  const current = await repository.get(id)
  if (!current) {
    throw new ContactMessageError(
      'MESSAGE_NOT_FOUND',
      'Ce message est introuvable.',
      404
    )
  }

  const updated = {
    ...current,
    status: selectedStatus,
    updatedAt: now.toISOString()
  }
  const saved = await repository.update(updated)
  if (!saved) {
    throw new ContactMessageError(
      'MESSAGE_UPDATE_CONFLICT',
      'Le message a été modifié ailleurs. Actualisez la liste.',
      409
    )
  }
  return saved
}
