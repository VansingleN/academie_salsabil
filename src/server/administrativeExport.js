const SECTIONS = new Set(['support', 'contact', 'orders'])
const FORMATS = new Set(['json', 'csv'])

export class AdministrativeExportError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'AdministrativeExportError'
    this.code = code
    this.status = status
  }
}

function serializeNested(value) {
  return value == null ? '' : JSON.stringify(value)
}

function supportRow(request) {
  return {
    reference: request.reference,
    statut: request.status,
    date_creation: request.createdAt,
    type_demande: request.mode,
    parent: request.contact?.parentName,
    email: request.contact?.email,
    telephone: request.contact?.phone,
    contact_prefere: request.contact?.preferredMethod,
    age_eleve: request.student?.age,
    niveau_eleve: request.student?.level,
    matieres: (request.request?.subjects ?? []).join(' | '),
    besoin: request.request?.objective,
    disponibilites: request.request?.availability,
    organisation: serializeNested({
      needType: request.request?.needType,
      format: request.request?.format,
      weeklyVolume: request.request?.weeklyVolume
    }),
    suppression_prevue: request.retention?.scheduledDeletionAt
  }
}

function contactRow(message) {
  return {
    reference: message.reference,
    statut: message.status,
    date_creation: message.createdAt,
    prenom: message.contact?.firstname,
    nom: message.contact?.lastname,
    email: message.contact?.email,
    telephone: message.contact?.phone,
    message: message.message,
    suppression_prevue: message.retention?.scheduledDeletionAt
  }
}

function orderRow(order) {
  return {
    numero_commande: order.publicOrderNumber,
    identifiant_interne: order.id,
    statut: order.status,
    statut_paiement: order.paymentStatus,
    date_creation: order.createdAt,
    responsable: [
      order.enrollment?.guardian?.firstName,
      order.enrollment?.guardian?.lastName
    ].filter(Boolean).join(' '),
    email: order.enrollment?.guardian?.email,
    telephone: order.enrollment?.guardian?.phone,
    pays_facturation: order.enrollment?.billingAddress?.countryCode,
    nombre_inscriptions: order.itemCount,
    premier_paiement_ht:
      order.paymentSummary?.firstPaymentExcludingTax ?? 0,
    total_contractuel_ht:
      order.paymentSummary?.contractTotalExcludingTax ?? 0,
    devise: order.currency,
    offres: serializeNested(order.items ?? []),
    eleves: serializeNested(order.enrollment?.students ?? []),
    session_stripe: order.checkoutSessionId,
    abonnement_stripe: order.subscriptionId
  }
}

function escapeCsvValue(value) {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

function createCsv(rows) {
  if (rows.length === 0) return '\uFEFF'
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(escapeCsvValue).join(';'),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(';')
    )
  ]
  return `\uFEFF${lines.join('\r\n')}`
}

export function createAdministrativeExport({
  section,
  format,
  records,
  generatedAt = new Date()
}) {
  if (!SECTIONS.has(section)) {
    throw new AdministrativeExportError(
      'INVALID_EXPORT_SECTION',
      'La catégorie d’export demandée est invalide.'
    )
  }
  if (!FORMATS.has(format)) {
    throw new AdministrativeExportError(
      'INVALID_EXPORT_FORMAT',
      'Le format d’export demandé est invalide.'
    )
  }

  const safeRecords = Array.isArray(records) ? records : []
  const date = generatedAt.toISOString().slice(0, 10)
  const filename = `academie-salsabil-${section}-${date}.${format}`

  if (format === 'json') {
    return {
      body: JSON.stringify({
        generatedAt: generatedAt.toISOString(),
        section,
        count: safeRecords.length,
        records: safeRecords
      }, null, 2),
      contentType: 'application/json; charset=utf-8',
      filename
    }
  }

  const rows = safeRecords.map(
    section === 'support'
      ? supportRow
      : section === 'contact'
        ? contactRow
        : orderRow
  )

  return {
    body: createCsv(rows),
    contentType: 'text/csv; charset=utf-8',
    filename
  }
}
