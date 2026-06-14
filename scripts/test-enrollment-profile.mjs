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

assert.equal(sanitized.schemaVersion, 'enrollment-profile-v2')
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

const academicSummerCart = [{
  cartItemId: 'profile-summer-academic',
  offerId: 'summerCamp-primary-personnalises-doux-une-semaine',
  selections: {
    billingCountry: 'FR',
    workshop: 'academiques'
  }
}]
const academicSummerQuote = createCartQuote({ items: academicSummerCart })
const academicSummerProfile = createEnrollmentProfile([
  'profile-summer-academic'
])

academicSummerProfile.students = [{
  cartItemId: 'profile-summer-academic',
  firstName: 'Yasmine',
  lastName: 'Benali',
  age: '8',
  schoolGrade: 'ce2'
}]

const sanitizedAcademicSummer = sanitizeEnrollmentProfile({
  enrollment: academicSummerProfile,
  quote: academicSummerQuote
})

assert.equal(sanitizedAcademicSummer.students[0].age, 8)
assert.equal(sanitizedAcademicSummer.students[0].schoolGrade, 'ce2')
assert.equal(sanitizedAcademicSummer.students[0].workshop, 'academiques')

const religiousSummerCart = [{
  cartItemId: 'profile-summer-religious',
  offerId: 'summerCamp-primary-groupes-doux-deux-semaines',
  selections: {
    billingCountry: 'FR',
    workshop: 'religieux'
  }
}]
const religiousSummerQuote = createCartQuote({ items: religiousSummerCart })
const religiousSummerProfile = createEnrollmentProfile([
  'profile-summer-religious'
])

religiousSummerProfile.students = [{
  cartItemId: 'profile-summer-religious',
  firstName: 'Adam',
  lastName: 'Benali',
  age: '10',
  arabicLevel: '2',
  quranLevel: '1'
}]

const sanitizedReligiousSummer = sanitizeEnrollmentProfile({
  enrollment: religiousSummerProfile,
  quote: religiousSummerQuote
})

assert.equal(sanitizedReligiousSummer.students[0].age, 10)
assert.equal(sanitizedReligiousSummer.students[0].arabicLevel, '2')
assert.equal(sanitizedReligiousSummer.students[0].quranLevel, '1')
assert.equal(sanitizedReligiousSummer.students[0].workshop, 'religieux')

const adolescentSummerCart = [{
  cartItemId: 'profile-summer-adolescents',
  offerId: 'summerCamp-adolescents-personnalises-equilibre-deux-semaines',
  selections: {
    billingCountry: 'FR',
    workshop: 'academiques'
  }
}]
const adolescentSummerQuote = createCartQuote({ items: adolescentSummerCart })
const adolescentSummerProfile = createEnrollmentProfile([
  'profile-summer-adolescents'
])

adolescentSummerProfile.students = [{
  cartItemId: 'profile-summer-adolescents',
  firstName: 'Maryam',
  lastName: 'Benali',
  age: '14',
  schoolGrade: '3e'
}]

const sanitizedAdolescentSummer = sanitizeEnrollmentProfile({
  enrollment: adolescentSummerProfile,
  quote: adolescentSummerQuote
})

assert.equal(sanitizedAdolescentSummer.students[0].age, 14)
assert.equal(sanitizedAdolescentSummer.students[0].schoolGrade, '3e')

assert.throws(
  () => sanitizeEnrollmentProfile({
    enrollment: {
      ...religiousSummerProfile,
      students: [{
        ...religiousSummerProfile.students[0],
        arabicLevel: '9'
      }]
    },
    quote: religiousSummerQuote
  }),
  EnrollmentProfileError
)

console.log('Dossier d’inscription : tests réussis')
