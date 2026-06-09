import assert from 'node:assert/strict'
import { createPaymentSchedule, isPlanAvailable } from '../src/server/paymentSchedule.js'

function createOffer(planId, {
  amount = 300,
  optionAmount = 30,
  applicationFee = 50
} = {}) {
  return {
    planId,
    amount,
    optionAmount,
    applicationFee: {
      enabled: applicationFee > 0,
      amount: applicationFee
    }
  }
}

const monthlyBeforeSchool = createPaymentSchedule({
  offer: createOffer('monthly'),
  enrollmentDate: '2026-06-09',
  countryCode: 'FR'
})

assert.equal(monthlyBeforeSchool.installmentCount, 10)
assert.equal(monthlyBeforeSchool.firstPayment.periodId, '2026-09')
assert.equal(monthlyBeforeSchool.firstPayment.subtotalExcludingTax, 380)
assert.equal(monthlyBeforeSchool.futurePayments[0].dueDate, '2026-10-07')
assert.equal(monthlyBeforeSchool.futurePayments.at(-1).dueDate, '2027-06-07')
assert.equal(monthlyBeforeSchool.totals.contractTotalExcludingTax, 3350)

const monthlyLate = createPaymentSchedule({
  offer: createOffer('monthly'),
  enrollmentDate: '2027-01-20',
  countryCode: 'BE'
})

assert.equal(monthlyLate.installmentCount, 5)
assert.equal(monthlyLate.firstPayment.periodId, '2027-02')
assert.equal(monthlyLate.firstPayment.dueDate, '2027-01-20')
assert.equal(monthlyLate.futurePayments[0].dueDate, '2027-03-07')

const quarterlyBeforeSchool = createPaymentSchedule({
  offer: createOffer('quarterly', { amount: 900, optionAmount: 90 }),
  enrollmentDate: '2026-06-09',
  countryCode: 'GB'
})

assert.equal(quarterlyBeforeSchool.installmentCount, 3)
assert.equal(quarterlyBeforeSchool.firstPayment.subtotalExcludingTax, 1040)
assert.equal(quarterlyBeforeSchool.futurePayments[0].dueDate, '2026-12-07')
assert.equal(quarterlyBeforeSchool.futurePayments[1].dueDate, '2027-03-07')

const quarterlyLate = createPaymentSchedule({
  offer: createOffer('quarterly', { amount: 900, optionAmount: 90 }),
  enrollmentDate: '2027-01-15',
  countryCode: 'AE'
})

assert.equal(quarterlyLate.installmentCount, 2)
assert.equal(quarterlyLate.firstPayment.proration.applied, true)
assert.equal(quarterlyLate.firstPayment.proration.coveredDays, 45)
assert.equal(quarterlyLate.firstPayment.proration.totalDays, 90)
assert.equal(quarterlyLate.firstPayment.baseAmount, 450)
assert.equal(quarterlyLate.firstPayment.optionAmount, 45)
assert.equal(quarterlyLate.firstPayment.applicationFeeAmount, 50)
assert.equal(quarterlyLate.firstPayment.subtotalExcludingTax, 545)
assert.equal(quarterlyLate.futurePayments[0].dueDate, '2027-03-07')

assert.equal(isPlanAvailable('annual', '2026-08-31'), true)
assert.equal(isPlanAvailable('annual', '2026-09-01'), false)
assert.equal(
  createPaymentSchedule({
    offer: createOffer('annual', { amount: 2800, optionAmount: 100, applicationFee: 0 }),
    enrollmentDate: '2026-09-01',
    countryCode: 'FR'
  }),
  null
)

assert.equal(monthlyBeforeSchool.tax.calculationMode, 'disabled')
assert.equal(monthlyBeforeSchool.tax.totalIncludingTax, null)

console.log('Échéancier scolaire : tests réussis')
