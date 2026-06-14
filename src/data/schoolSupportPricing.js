export const schoolSupportPricing = {
  individual: {
    amount: 22,
    label: 'Accompagnement individuel',
    unit: 'par heure'
  },
  group: {
    amount: 14,
    label: 'Petit groupe',
    unit: 'par heure et par élève',
    minimumStudents: 2,
    maximumStudents: 6
  },
  standardSessionMinutes: 60,
  extendedSessionMinutes: 90,
  rescheduleNoticeHours: 24,
  proposalValidityHours: 72
}

export const formatSchoolSupportPrice = (amount) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount)
