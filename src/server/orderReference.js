function getSchoolYearCode(order) {
  const schoolYearId = order.items?.[0]?.paymentSchedule?.schoolYearId
  const match = typeof schoolYearId === 'string'
    ? schoolYearId.match(/^(\d{4})-(\d{4})$/)
    : null

  return match
    ? `${match[1].slice(-2)}${match[2].slice(-2)}`
    : '0000'
}

// Le numéro lisible reste dérivé de l'identifiant opaque de la commande. Il ne
// contient aucune information personnelle et peut donc apparaître dans Stripe,
// les e-mails et les journaux techniques.
export function createPublicOrderNumber(order) {
  const suffix = String(order.id ?? '')
    .replace(/^ord_/, '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 8)
    .toUpperCase()

  return `AS-${getSchoolYearCode(order)}-${suffix || 'INCONNU'}`
}
