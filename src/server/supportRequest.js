const ALLOWED_MODES = new Set(['slot', 'advice'])
const ALLOWED_NEED_TYPES = new Set(['regulier', 'ponctuel'])
const ALLOWED_FORMATS = new Set(['individual', 'group', 'undecided'])
const ALLOWED_WEEKLY_VOLUMES = new Set(['1', '2', '3+', 'single'])
const ALLOWED_CONTACT_METHODS = new Set(['telephone', 'whatsapp', 'email'])
const ALLOWED_SUBJECTS = new Set([
  'Français',
  'Mathématiques',
  'Histoire-géographie',
  'Anglais',
  'SVT',
  'Physique-chimie',
  'Technologie'
])
const ALLOWED_STATUSES = new Set(['new', 'contacted', 'closed'])
const ALLOWED_SORTS = new Set(['newest', 'oldest'])
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50
import { recordFormNotification } from './formNotification.js'

export class SupportRequestError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'SupportRequestError'
    this.code = code
    this.status = status
  }
}

function cleanText(value, { required = false, maxLength = 200 } = {}) {
  const text = typeof value === 'string' ? value.trim() : ''

  if (required && !text) {
    throw new SupportRequestError(
      'MISSING_FIELD',
      'Certains champs obligatoires sont manquants.'
    )
  }

  if (text.length > maxLength) {
    throw new SupportRequestError(
      'FIELD_TOO_LONG',
      'Une information saisie dépasse la longueur autorisée.'
    )
  }

  return text
}

function requireAllowed(value, allowedValues) {
  if (!allowedValues.has(value)) {
    throw new SupportRequestError(
      'INVALID_FIELD',
      'Une option sélectionnée n’est pas valide.'
    )
  }

  return value
}

function createRequestReference(now, randomId) {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = randomId.replaceAll('-', '').slice(0, 8).toUpperCase()
  return `SOUTIEN-${date}-${suffix}`
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function listSupportRequests(
  requests,
  {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search = '',
    status = 'all',
    sort = 'newest'
  } = {}
) {
  const normalizedPage = Math.max(1, Number.parseInt(page, 10) || 1)
  const normalizedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE)
  )
  const normalizedSearch = cleanText(search, { maxLength: 120 })
  const normalizedStatus =
    status === 'all' ? 'all' : requireAllowed(status, ALLOWED_STATUSES)
  const normalizedSort = requireAllowed(sort, ALLOWED_SORTS)
  const searchNeedle = normalizeSearchText(normalizedSearch)

  const filtered = requests
    .filter((request) => {
      if (normalizedStatus !== 'all' && request.status !== normalizedStatus) {
        return false
      }

      if (!searchNeedle) return true

      const searchableValues = [
        request.reference,
        request.contact?.parentName,
        request.contact?.email,
        request.contact?.phone,
        request.student?.level,
        ...(request.request?.subjects ?? [])
      ]

      return normalizeSearchText(searchableValues.join(' ')).includes(searchNeedle)
    })
    .sort((left, right) => {
      const comparison = left.createdAt.localeCompare(right.createdAt)
      return normalizedSort === 'oldest' ? comparison : -comparison
    })

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize))
  const currentPage = Math.min(normalizedPage, totalPages)
  const startIndex = (currentPage - 1) * normalizedPageSize

  return {
    requests: filtered.slice(startIndex, startIndex + normalizedPageSize),
    pagination: {
      page: currentPage,
      pageSize: normalizedPageSize,
      totalItems,
      totalPages,
      from: totalItems === 0 ? 0 : startIndex + 1,
      to: Math.min(startIndex + normalizedPageSize, totalItems)
    },
    filters: {
      search: normalizedSearch,
      status: normalizedStatus,
      sort: normalizedSort
    }
  }
}

export async function createSupportRequest(
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
    throw new Error('Le dépôt des demandes de soutien est indisponible.')
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new SupportRequestError(
      'INVALID_PAYLOAD',
      'Le contenu de la demande est invalide.'
    )
  }

  // Ce champ invisible doit rester vide. Il limite les soumissions automatisées
  // sans imposer de friction supplémentaire aux familles.
  if (cleanText(payload.website, { maxLength: 200 })) {
    throw new SupportRequestError(
      'SPAM_DETECTED',
      'La demande n’a pas pu être enregistrée.',
      422
    )
  }

  const mode = requireAllowed(payload.mode, ALLOWED_MODES)
  const email = cleanText(payload.email, { required: true, maxLength: 254 }).toLowerCase()
  const phone = cleanText(payload.phone, { required: true, maxLength: 40 })
  const studentAge = Number(payload.studentAge)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new SupportRequestError(
      'INVALID_EMAIL',
      'L’adresse e-mail indiquée n’est pas valide.'
    )
  }

  if (!Number.isInteger(studentAge) || studentAge < 5 || studentAge > 20) {
    throw new SupportRequestError(
      'INVALID_AGE',
      'L’âge de l’élève doit être compris entre 5 et 20 ans.'
    )
  }

  if (payload.consent !== true) {
    throw new SupportRequestError(
      'CONSENT_REQUIRED',
      'Votre accord est nécessaire pour être recontacté.'
    )
  }

  const selectedSubjects = Array.isArray(payload.subjects)
    ? [...new Set(payload.subjects)].filter((subject) => ALLOWED_SUBJECTS.has(subject))
    : []

  if (mode === 'slot' && selectedSubjects.length === 0) {
    throw new SupportRequestError(
      'SUBJECT_REQUIRED',
      'Sélectionnez au moins une matière.'
    )
  }

  const id = `support_${randomId}`
  const request = {
    id,
    reference: createRequestReference(now, randomId),
    status: 'new',
    createdAt: now.toISOString(),
    mode,
    contact: {
      parentName: cleanText(payload.parentName, { required: true, maxLength: 120 }),
      email,
      phone,
      preferredMethod: requireAllowed(
        payload.preferredContact,
        ALLOWED_CONTACT_METHODS
      )
    },
    student: {
      age: studentAge,
      level: cleanText(payload.level, { required: true, maxLength: 80 })
    },
    request: {
      subjects: selectedSubjects,
      needType:
        mode === 'slot'
          ? requireAllowed(payload.needType, ALLOWED_NEED_TYPES)
          : null,
      format:
        mode === 'slot'
          ? requireAllowed(payload.format, ALLOWED_FORMATS)
          : null,
      weeklyVolume:
        mode === 'slot'
          ? requireAllowed(payload.weeklyVolume, ALLOWED_WEEKLY_VOLUMES)
          : null,
      desiredStartDate:
        mode === 'slot'
          ? cleanText(payload.startDate, { maxLength: 10 }) || null
          : null,
      objective: cleanText(payload.objective, {
        required: true,
        maxLength: 3000
      }),
      availability: cleanText(payload.availability, {
        required: true,
        maxLength: 1500
      })
    },
    consent: {
      contact: true,
      recordedAt: now.toISOString()
    },
    notification: {
      status: 'not-configured'
    }
  }

  await repository.save(request)

  if (notificationService?.notifySupportRequest && repository.update) {
    await recordFormNotification({
      record: request,
      repository,
      notificationService,
      method: 'notifySupportRequest',
      now,
      logger
    })
  }

  return {
    accepted: true,
    reference: request.reference,
    createdAt: request.createdAt
  }
}

export async function updateSupportRequestStatus(
  { requestId, status },
  { repository, now = new Date() } = {}
) {
  if (!repository?.get || !repository?.update) {
    throw new Error('Le dépôt des demandes de soutien est indisponible.')
  }

  const normalizedRequestId = cleanText(requestId, {
    required: true,
    maxLength: 100
  })
  const normalizedStatus = requireAllowed(status, ALLOWED_STATUSES)
  const request = await repository.get(normalizedRequestId)

  if (!request) {
    throw new SupportRequestError(
      'REQUEST_NOT_FOUND',
      'Cette demande de soutien est introuvable.',
      404
    )
  }

  const updatedRequest = {
    ...request,
    status: normalizedStatus,
    updatedAt: now.toISOString()
  }

  const saved = await repository.update(updatedRequest)

  if (!saved) {
    throw new SupportRequestError(
      'REQUEST_UPDATE_CONFLICT',
      'La demande a été modifiée ailleurs. Actualisez la liste.',
      409
    )
  }

  return saved
}
