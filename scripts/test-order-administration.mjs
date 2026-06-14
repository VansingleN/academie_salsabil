import assert from 'node:assert/strict'
import { listAdministrativeOrders } from '../src/server/orderAdministration.js'

const order = {
  id: 'ord_test',
  publicOrderNumber: 'AS-2627-TEST',
  status: 'paid',
  paymentStatus: 'paid',
  scheduleStatus: 'not_required',
  currency: 'eur',
  itemCount: 1,
  createdAt: '2026-06-14T10:00:00.000Z',
  updatedAt: '2026-06-14T10:05:00.000Z',
  checkoutSessionId: 'cs_test_123',
  subscriptionId: null,
  paymentSummary: {
    firstPaymentExcludingTax: 2960,
    futurePaymentsExcludingTax: 0,
    contractTotalExcludingTax: 2960,
    installmentCount: 1
  },
  enrollment: {
    guardian: {
      firstName: 'Amira',
      lastName: 'Benali',
      email: 'parent@example.com',
      phone: '+33 6 12 34 56 78',
      relationship: 'mother'
    },
    billingAddress: {
      line1: '12 rue des Écoles',
      line2: '',
      postalCode: '75005',
      city: 'Paris',
      countryCode: 'FR'
    },
    students: [{
      cartItemId: 'cart-1',
      firstName: 'Yasmine',
      lastName: 'Benali',
      birthDate: '2018-03-15',
      schoolingStatus: 'school_enrolled',
      learningObjectives: 'Renforcer les bases.',
      accommodations: ''
    }],
    consents: {
      terms: {
        accepted: true,
        version: 'private-test-value'
      }
    }
  },
  items: [{
    cartItemId: 'cart-1',
    offerId: 'primary-cp-annual',
    curriculum: 'Primaire',
    grade: 'CP',
    plan: 'Annuel',
    planId: 'annual',
    billingCountry: 'FR',
    selectedOptions: [],
    paymentSchedule: {
      totals: {
        firstPaymentExcludingTax: 2960,
        contractTotalExcludingTax: 2960
      },
      futurePayments: [],
      manualPayments: []
    }
  }],
  eventHistory: []
}

const result = listAdministrativeOrders([order], {
  search: 'yasmine',
  status: 'paid'
})

assert.equal(result.orders.length, 1)
assert.equal(result.pagination.totalItems, 1)
assert.equal(result.orders[0].guardian.email, 'parent@example.com')
assert.equal(result.orders[0].entries[0].student.firstName, 'Yasmine')
assert.equal('enrollment' in result.orders[0], false)
assert.equal(JSON.stringify(result.orders[0]).includes('private-test-value'), false)

const empty = listAdministrativeOrders([order], {
  search: 'inconnu'
})
assert.equal(empty.orders.length, 0)

console.log('Order administration tests passed.')
