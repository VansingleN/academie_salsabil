const EMAIL_TEMPLATE_IDS = {
  initialPaymentConfirmed: 'initial_payment_confirmed',
  scheduleCreated: 'schedule_created',
  installmentPaid: 'installment_paid',
  paymentFailed: 'payment_failed',
  subscriptionCancelled: 'subscription_cancelled'
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatEuro(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(amount) || 0)
}

function formatDate(dateValue) {
  if (!dateValue) return 'date non disponible'

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${dateValue}T00:00:00.000Z`))
}

function createOrderSummary(order) {
  const students = new Map(
    order.enrollment?.students?.map((student) => [
      student.cartItemId,
      student.firstName
    ]) ?? []
  )

  return order.items.map((item) => ({
    studentFirstName: students.get(item.cartItemId) ?? 'Élève',
    curriculum: item.curriculum,
    grade: item.grade,
    plan: item.plan
  }))
}

function renderSummaryText(summary) {
  return summary
    .map((item) =>
      `- ${item.studentFirstName} : ${item.curriculum}, ${item.grade}, formule ${item.plan}`)
    .join('\n')
}

function renderSummaryHtml(summary) {
  return `<ul>${summary.map((item) => (
    `<li><strong>${escapeHtml(item.studentFirstName)}</strong> : `
    + `${escapeHtml(item.curriculum)}, ${escapeHtml(item.grade)}, `
    + `formule ${escapeHtml(item.plan)}</li>`
  )).join('')}</ul>`
}

function getInvoiceAmount(event) {
  const cents = event.data?.object?.amount_paid
    ?? event.data?.object?.amount_due
    ?? 0

  return Number(cents) / 100
}

function createTemplateContent({ templateId, order, event }) {
  const orderNumber = order.publicOrderNumber
  const firstPayment = order.paymentSummary?.firstPaymentExcludingTax ?? 0
  const futureCount = order.futureInstallmentCount
    ?? order.items.reduce(
      (count, item) => Math.max(
        count,
        item.paymentSchedule?.futurePayments?.length ?? 0
      ),
      0
    )
  const scheduleStart = order.scheduleStartDate
    ?? order.items.find(
      (item) => item.paymentSchedule?.futurePayments?.length
    )?.paymentSchedule?.futurePayments?.[0]?.dueDate
  const invoiceAmount = getInvoiceAmount(event)

  switch (templateId) {
    case EMAIL_TEMPLATE_IDS.initialPaymentConfirmed:
      return {
        subject: `Paiement confirmé · ${orderNumber}`,
        heading: 'Votre premier paiement est confirmé',
        familyMessage:
          `Nous avons bien reçu votre premier paiement de ${formatEuro(firstPayment)} HT.`,
        internalMessage:
          `Le premier paiement de ${formatEuro(firstPayment)} HT a été confirmé.`,
        detail: 'Le dossier peut maintenant être pris en charge par l’équipe.'
      }

    case EMAIL_TEMPLATE_IDS.scheduleCreated:
      return {
        subject: `Échéancier créé · ${orderNumber}`,
        heading: 'Votre échéancier est en place',
        familyMessage:
          `${futureCount} échéance${futureCount > 1 ? 's' : ''} future`
          + `${futureCount > 1 ? 's sont' : ' est'} programmée`
          + `${futureCount > 1 ? 's' : ''}.`,
        internalMessage:
          `L’échéancier Stripe de ${futureCount} prélèvement`
          + `${futureCount > 1 ? 's' : ''} a été créé.`,
        detail: `Première échéance prévue le ${formatDate(scheduleStart)}.`
      }

    case EMAIL_TEMPLATE_IDS.installmentPaid:
      return {
        subject: `Échéance réglée · ${orderNumber}`,
        heading: 'Votre échéance a été réglée',
        familyMessage:
          `Stripe a confirmé le règlement de ${formatEuro(invoiceAmount)}.`,
        internalMessage:
          `Une échéance de ${formatEuro(invoiceAmount)} a été réglée.`,
        detail: 'Aucune action n’est nécessaire.'
      }

    case EMAIL_TEMPLATE_IDS.paymentFailed:
      return {
        subject: `Paiement à régulariser · ${orderNumber}`,
        heading: 'Une échéance n’a pas pu être réglée',
        familyMessage:
          `Le règlement de ${formatEuro(invoiceAmount)} n’a pas abouti.`,
        internalMessage:
          `Une échéance de ${formatEuro(invoiceAmount)} a échoué.`,
        detail:
          'La famille sera accompagnée selon la procédure de relance prévue.'
      }

    case EMAIL_TEMPLATE_IDS.subscriptionCancelled:
      return {
        subject: `Échéancier arrêté · ${orderNumber}`,
        heading: 'Votre échéancier a été arrêté',
        familyMessage:
          'Stripe a confirmé l’arrêt des prélèvements futurs.',
        internalMessage:
          'L’abonnement Stripe et ses prélèvements futurs ont été arrêtés.',
        detail: 'Le dossier doit être vérifié par l’équipe administrative.'
      }

    default:
      return null
  }
}

function renderMessage({
  audience,
  recipient,
  templateId,
  order,
  event
}) {
  const content = createTemplateContent({ templateId, order, event })

  if (!content) return null

  const summary = createOrderSummary(order)
  const isFamily = audience === 'family'
  const greeting = isFamily
    ? `Bonjour ${order.enrollment.guardian.firstName},`
    : 'Bonjour,'
  const mainMessage = isFamily
    ? content.familyMessage
    : content.internalMessage
  const text = [
    greeting,
    '',
    content.heading,
    mainMessage,
    content.detail,
    '',
    `Commande : ${order.publicOrderNumber}`,
    renderSummaryText(summary),
    '',
    'Académie Salsabil'
  ].join('\n')
  const html = `
    <p>${escapeHtml(greeting)}</p>
    <h1>${escapeHtml(content.heading)}</h1>
    <p>${escapeHtml(mainMessage)}</p>
    <p>${escapeHtml(content.detail)}</p>
    <p><strong>Commande :</strong> ${escapeHtml(order.publicOrderNumber)}</p>
    ${renderSummaryHtml(summary)}
    <p>Académie Salsabil</p>
  `.trim()

  return {
    templateId,
    audience,
    to: recipient,
    subject: content.subject,
    text,
    html,
    orderNumber: order.publicOrderNumber,
    // Ces données techniques permettent un suivi fournisseur sans PII.
    tags: {
      templateId,
      audience,
      orderNumber: order.publicOrderNumber
    }
  }
}

function getTemplateIdsForEvent(event, order) {
  switch (event.type) {
    case 'checkout.session.completed':
      if (event.data.object.payment_status !== 'paid') return []
      return order.scheduleStatus === 'scheduled'
        ? [
            EMAIL_TEMPLATE_IDS.initialPaymentConfirmed,
            EMAIL_TEMPLATE_IDS.scheduleCreated
          ]
        : [EMAIL_TEMPLATE_IDS.initialPaymentConfirmed]
    case 'invoice.paid':
      return [EMAIL_TEMPLATE_IDS.installmentPaid]
    case 'invoice.payment_failed':
      return [EMAIL_TEMPLATE_IDS.paymentFailed]
    case 'customer.subscription.deleted':
      return [EMAIL_TEMPLATE_IDS.subscriptionCancelled]
    default:
      return []
  }
}

export function buildTransactionalEmailMessages({
  event,
  order,
  internalRecipient
}) {
  if (!order?.enrollment?.guardian?.email || !order.publicOrderNumber) return []

  const recipients = [
    {
      audience: 'family',
      recipient: order.enrollment.guardian.email
    },
    {
      audience: 'internal',
      recipient: internalRecipient
    }
  ]

  return getTemplateIdsForEvent(event, order).flatMap((templateId) =>
    recipients.map(({ audience, recipient }) =>
      renderMessage({
        audience,
        recipient,
        templateId,
        order,
        event
      })
    )
  ).filter(Boolean)
}

export { EMAIL_TEMPLATE_IDS }
