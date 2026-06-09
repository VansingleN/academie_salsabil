import assert from 'node:assert/strict'
import { createCartQuote } from '../src/server/cartQuote.js'
import {
  EnrollmentProfileError,
  sanitizeEnrollmentProfile
} from '../src/server/enrollmentProfile.js'
import {
  createEnrollmentProfile
} from './fixtures/enrollment-profile.mjs'

const cartItems = [
  {
    cartItemId: 'profile-primary-cp',
    offerId: 'primary-cp-monthly',
    selections: {
      billingCountry: 'FR',
      timeSlot: 'morning',
      arabicLanguage: 'none'
    }
  },
  {
    cartItemId: 'profile-primary-ce1',
    offerId: 'primary-ce1-monthly',
    selections: {
      billingCountry: 'FR',
      timeSlot: 'afternoon',
      arabicLanguage: 'none'
    }
  }
]
const quote = createCartQuote(
  { items: cartItems },
  { enrollmentDate: '2026-06-09' }
)
const profile = createEnrollmentProfile(
  cartItems.map((item) => item.cartItemId)
)
const sanitized = sanitizeEnrollmentProfile({
  enrollment: profile,
  quote,
  now: () => '2026-06-09T18:00:00.000Z'
})

assert.equal(sanitized.schemaVersion, 'enrollment-profile-v1')
assert.equal(sanitized.guardian.firstName, 'Amira')
assert.equal(sanitized.guardian.email, 'parent@example.com')
assert.equal(sanitized.billingAddress.countryCode, 'FR')
assert.equal(sanitized.students.length, 2)
assert.equal(sanitized.students[0].offerId, 'primary-cp-monthly')
assert.equal(sanitized.students[1].grade, 'CE1')
assert.equal(
  sanitized.consents.terms.acceptedAt,
  '2026-06-09T18:00:00.000Z'
)

// Une fiche doit correspondre exactement à chaque ligne du panier.
assert.throws(
  () => sanitizeEnrollmentProfile({
    enrollment: {
      ...profile,
      students: profile.students.slice(0, 1)
    },
    quote
  }),
  EnrollmentProfileError
)

// Le pays saisi ne peut pas contredire celui utilisé pour le devis.
assert.throws(
  () => sanitizeEnrollmentProfile({
    enrollment: {
      ...profile,
      billingAddress: {
        ...profile.billingAddress,
        countryCode: 'BE'
      }
    },
    quote
  }),
  (error) => error.code === 'BILLING_COUNTRY_MISMATCH'
)

// Le serveur refuse les anciennes versions et les consentements non cochés.
assert.throws(
  () => sanitizeEnrollmentProfile({
    enrollment: {
      ...profile,
      consents: {
        ...profile.consents,
        terms: { accepted: false, version: 'cgv-obsolete' }
      }
    },
    quote
  }),
  (error) => error.code === 'CONSENT_REQUIRED'
)

// Les champs supplémentaires sont refusés plutôt que conservés silencieusement.
assert.throws(
  () => sanitizeEnrollmentProfile({
    enrollment: {
      ...profile,
      guardian: { ...profile.guardian, isAdmin: true }
    },
    quote
  }),
  EnrollmentProfileError
)

// Les objectifs trop longs ne doivent pas gonfler le stockage des commandes.
assert.throws(
  () => sanitizeEnrollmentProfile({
    enrollment: {
      ...profile,
      students: profile.students.map((student, index) => (
        index === 0
          ? { ...student, learningObjectives: 'x'.repeat(1201) }
          : student
      ))
    },
    quote
  }),
  EnrollmentProfileError
)

assert.throws(
  () => sanitizeEnrollmentProfile({
    enrollment: {
      ...profile,
      students: profile.students.map((student, index) => (
        index === 0
          ? { ...student, birthDate: '2018-02-31' }
          : student
      ))
    },
    quote,
    now: () => '2026-06-09T18:00:00.000Z'
  }),
  EnrollmentProfileError
)

console.log('Dossier d’inscription : tests réussis')
