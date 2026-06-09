import { activeSchoolYear } from '../data/schoolCalendar.js'
import { taxPolicy } from '../data/taxPolicy.js'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

function toUtcDate(dateValue) {
  const normalized = dateValue instanceof Date
    ? dateValue.toISOString().slice(0, 10)
    : String(dateValue).slice(0, 10)

  return new Date(`${normalized}T00:00:00.000Z`)
}

function toDateString(dateValue) {
  return toUtcDate(dateValue).toISOString().slice(0, 10)
}

function compareDates(left, right) {
  return toUtcDate(left).getTime() - toUtcDate(right).getTime()
}

function inclusiveDayCount(start, end) {
  return Math.floor(
    (toUtcDate(end).getTime() - toUtcDate(start).getTime()) / DAY_IN_MILLISECONDS
  ) + 1
}

function roundCurrency(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

function buildTaxSnapshot(countryCode) {
  return {
    calculationMode: taxPolicy.calculationMode,
    priceBehavior: taxPolicy.priceBehavior,
    countryCode,
    status: 'pending_configuration',
    taxAmount: null,
    totalIncludingTax: null
  }
}

function buildInstallment({
  sequence,
  collection,
  dueDate,
  period,
  baseAmount,
  optionAmount,
  applicationFeeAmount = 0,
  proration = null,
  countryCode
}) {
  const subtotalExcludingTax = roundCurrency(
    baseAmount + optionAmount + applicationFeeAmount
  )

  return {
    sequence,
    collection,
    dueDate,
    periodId: period.id,
    periodLabel: period.label,
    periodStart: period.start,
    periodEnd: period.end,
    baseAmount: roundCurrency(baseAmount),
    optionAmount: roundCurrency(optionAmount),
    applicationFeeAmount: roundCurrency(applicationFeeAmount),
    subtotalExcludingTax,
    proration,
    tax: buildTaxSnapshot(countryCode)
  }
}

function buildScheduleResult({
  offer,
  enrollmentDate,
  countryCode,
  installments,
  schoolYear,
  lateEnrollment
}) {
  const firstPayment = installments[0]
  const futurePayments = installments.slice(1)

  return {
    schoolYearId: schoolYear.id,
    schoolYearLabel: schoolYear.label,
    calendarStatus: schoolYear.status,
    planId: offer.planId,
    enrollmentDate,
    serviceStart: firstPayment?.periodStart ?? null,
    serviceEnd: installments.at(-1)?.periodEnd ?? null,
    lateEnrollment,
    installmentCount: installments.length,
    firstPayment,
    futurePayments,
    installments,
    totals: {
      firstPaymentExcludingTax: firstPayment?.subtotalExcludingTax ?? 0,
      futurePaymentsExcludingTax: roundCurrency(
        futurePayments.reduce(
          (total, installment) => total + installment.subtotalExcludingTax,
          0
        )
      ),
      contractTotalExcludingTax: roundCurrency(
        installments.reduce(
          (total, installment) => total + installment.subtotalExcludingTax,
          0
        )
      )
    },
    tax: buildTaxSnapshot(countryCode)
  }
}

function getMonthlyPeriods(enrollmentDate, schoolYear) {
  if (compareDates(enrollmentDate, schoolYear.schoolStart) < 0) {
    return schoolYear.monthlyPeriods
  }

  // Une inscription mensuelle tardive débute le mois suivant : aucun mois
  // commencé avant l'inscription n'est facturé rétroactivement.
  return schoolYear.monthlyPeriods.filter(
    (period) => compareDates(period.start, enrollmentDate) > 0
  )
}

function buildMonthlySchedule({
  offer,
  enrollmentDate,
  countryCode,
  schoolYear
}) {
  const periods = getMonthlyPeriods(enrollmentDate, schoolYear)

  return periods.map((period, index) => buildInstallment({
    sequence: index + 1,
    collection: index === 0 ? 'immediate' : 'scheduled',
    dueDate: index === 0 ? enrollmentDate : period.chargeDate,
    period,
    baseAmount: offer.amount,
    optionAmount: offer.optionAmount,
    applicationFeeAmount: index === 0 ? offer.applicationFee.amount : 0,
    countryCode
  }))
}

function buildQuarterlySchedule({
  offer,
  enrollmentDate,
  countryCode,
  schoolYear
}) {
  const firstPeriodIndex = schoolYear.quarterlyPeriods.findIndex((period) =>
    compareDates(enrollmentDate, period.end) <= 0
  )

  if (firstPeriodIndex === -1) return []

  const periods = schoolYear.quarterlyPeriods.slice(firstPeriodIndex)

  return periods.map((period, index) => {
    const isFirstInstallment = index === 0
    const startsAfterEnrollment = compareDates(enrollmentDate, period.start) <= 0
    const coveredStart = startsAfterEnrollment ? period.start : enrollmentDate
    const totalDays = inclusiveDayCount(period.start, period.end)
    const coveredDays = inclusiveDayCount(coveredStart, period.end)
    const ratio = coveredDays / totalDays
    const prorated = isFirstInstallment && ratio < 1

    return buildInstallment({
      sequence: index + 1,
      collection: isFirstInstallment ? 'immediate' : 'scheduled',
      dueDate: isFirstInstallment ? enrollmentDate : period.chargeDate,
      period: { ...period, start: coveredStart },
      baseAmount: prorated ? offer.amount * ratio : offer.amount,
      optionAmount: prorated ? offer.optionAmount * ratio : offer.optionAmount,
      applicationFeeAmount: isFirstInstallment ? offer.applicationFee.amount : 0,
      proration: prorated
        ? {
            applied: true,
            method: 'calendar_days',
            coveredDays,
            totalDays,
            ratio: Math.round(ratio * 1000000) / 1000000
          }
        : { applied: false },
      countryCode
    })
  })
}

function buildAnnualSchedule({
  offer,
  enrollmentDate,
  countryCode,
  schoolYear
}) {
  if (compareDates(enrollmentDate, schoolYear.annualEnrollmentDeadline) > 0) {
    return []
  }

  return [
    buildInstallment({
      sequence: 1,
      collection: 'immediate',
      dueDate: enrollmentDate,
      period: {
        id: schoolYear.id,
        label: schoolYear.label,
        start: schoolYear.schoolStart,
        end: schoolYear.schoolEnd
      },
      baseAmount: offer.amount,
      optionAmount: offer.optionAmount,
      applicationFeeAmount: offer.applicationFee.amount,
      countryCode
    })
  ]
}

export function isPlanAvailable(
  planId,
  enrollmentDate = new Date(),
  schoolYear = activeSchoolYear
) {
  const normalizedDate = toDateString(enrollmentDate)

  if (compareDates(normalizedDate, schoolYear.schoolEnd) > 0) return false
  if (planId === 'annual') {
    return compareDates(normalizedDate, schoolYear.annualEnrollmentDeadline) <= 0
  }
  if (planId === 'monthly') {
    return getMonthlyPeriods(normalizedDate, schoolYear).length > 0
  }

  return schoolYear.quarterlyPeriods.some(
    (period) => compareDates(normalizedDate, period.end) <= 0
  )
}

// Le moteur produit un échéancier métier complet sans créer d'abonnement Stripe.
// Le pays est déjà exigé afin que la taxe puisse être activée plus tard sans
// modifier le contrat de données du panier et du devis.
export function createPaymentSchedule({
  offer,
  enrollmentDate = new Date(),
  countryCode,
  schoolYear = activeSchoolYear
}) {
  const normalizedEnrollmentDate = toDateString(enrollmentDate)
  const lateEnrollment =
    compareDates(normalizedEnrollmentDate, schoolYear.schoolStart) >= 0

  const commonParameters = {
    offer,
    enrollmentDate: normalizedEnrollmentDate,
    countryCode,
    schoolYear
  }
  const installments = offer.planId === 'monthly'
    ? buildMonthlySchedule(commonParameters)
    : offer.planId === 'quarterly'
      ? buildQuarterlySchedule(commonParameters)
      : buildAnnualSchedule(commonParameters)

  if (installments.length === 0) return null

  return buildScheduleResult({
    offer,
    enrollmentDate: normalizedEnrollmentDate,
    countryCode,
    installments,
    schoolYear,
    lateEnrollment
  })
}

