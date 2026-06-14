import { isValidBillingCountry } from '../data/countries.js'
import {
  enrollmentConsentVersions
} from '../data/enrollmentProfile.js'

const RELATIONSHIPS = new Set(['mother', 'father', 'legal_guardian', 'other'])
const SCHOOLING_STATUSES = new Set([
  'school_enrolled',
  'home_instruction',
  'not_enrolled',
  'other'
])
const PRIMARY_GRADES = new Set(['cp', 'ce1', 'ce2', 'cm1', 'cm2'])
const ADOLESCENT_GRADES = new Set(['6e', '5e', '4e', '3e', 'seconde'])
const ARABIC_LEVELS = new Set(['0', '1', '2', '3', '4', '5'])
const QURAN_LEVELS = new Set(['0', '1', '2', '3'])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

class EnrollmentProfileError extends Error {
  constructor(message, status = 400, code = 'INVALID_ENROLLMENT_PROFILE') {
    super(message)
    this.name = 'EnrollmentProfileError'
    this.status = status
    this.code = code
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function assertAllowedKeys(value, allowedKeys, label) {
  if (!isPlainObject(value)) {
    throw new EnrollmentProfileError(`${label} est invalide.`)
  }

  const unexpectedKey = Object.keys(value).find(
    (key) => !allowedKeys.includes(key)
  )

  if (unexpectedKey) {
    throw new EnrollmentProfileError(
      `Le champ « ${unexpectedKey} » n’est pas autorisé dans ${label.toLowerCase()}.`
    )
  }
}

function cleanText(value, {
  label,
  required = false,
  maxLength = 120,
  multiline = false
}) {
  const normalized = typeof value === 'string'
    ? value
        .replace(multiline ? /[^\P{C}\n\t]/gu : /\p{C}/gu, '')
        .replace(multiline ? /[ \t]+/g : /\s+/g, ' ')
        .trim()
    : ''

  if (required && normalized.length === 0) {
    throw new EnrollmentProfileError(`Le champ « ${label} » est obligatoire.`)
  }

  if (normalized.length > maxLength) {
    throw new EnrollmentProfileError(
      `Le champ « ${label} » dépasse ${maxLength} caractères.`
    )
  }

  return normalized
}

function cleanEmail(value) {
  const email = cleanText(value, {
    label: 'Adresse e-mail',
    required: true,
    maxLength: 254
  }).toLowerCase()

  if (!EMAIL_PATTERN.test(email)) {
    throw new EnrollmentProfileError('L’adresse e-mail est invalide.')
  }

  return email
}

function cleanPhone(value) {
  const phone = cleanText(value, {
    label: 'Téléphone',
    required: true,
    maxLength: 32
  })
  const digits = phone.replace(/\D/g, '')

  if (!/^[+()\d.\s-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
    throw new EnrollmentProfileError('Le numéro de téléphone est invalide.')
  }

  return phone
}

function cleanBirthDate(value, now) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new EnrollmentProfileError('La date de naissance est invalide.')
  }

  const birthDate = new Date(`${value}T00:00:00.000Z`)
  const referenceDate = new Date(now)
  const oldest = new Date(referenceDate)
  const youngest = new Date(referenceDate)

  oldest.setUTCFullYear(oldest.getUTCFullYear() - 25)
  youngest.setUTCFullYear(youngest.getUTCFullYear() - 2)

  if (
    Number.isNaN(birthDate.getTime())
    || birthDate.toISOString().slice(0, 10) !== value
    || birthDate < oldest
    || birthDate > youngest
  ) {
    throw new EnrollmentProfileError(
      'La date de naissance doit correspondre à un élève âgé de 2 à 25 ans.'
    )
  }

  return value
}

function cleanAge(value) {
  const age = Number(value)

  if (!Number.isInteger(age) || age < 3 || age > 18) {
    throw new EnrollmentProfileError(
      'L’âge de l’élève doit être compris entre 3 et 18 ans.'
    )
  }

  return age
}

function getSummerCampWorkshop(item) {
  return item.selectedOptions.find(
    (option) => option.name === 'workshop'
  )?.value
}

function sanitizeGuardian(guardian) {
  assertAllowedKeys(
    guardian,
    ['firstName', 'lastName', 'email', 'phone', 'relationship'],
    'Le responsable légal'
  )

  if (!RELATIONSHIPS.has(guardian.relationship)) {
    throw new EnrollmentProfileError('Le lien avec l’élève est invalide.')
  }

  return {
    firstName: cleanText(guardian.firstName, {
      label: 'Prénom du responsable',
      required: true,
      maxLength: 80
    }),
    lastName: cleanText(guardian.lastName, {
      label: 'Nom du responsable',
      required: true,
      maxLength: 80
    }),
    email: cleanEmail(guardian.email),
    phone: cleanPhone(guardian.phone),
    relationship: guardian.relationship
  }
}

function sanitizeBillingAddress(address, expectedCountryCode) {
  assertAllowedKeys(
    address,
    ['line1', 'line2', 'postalCode', 'city', 'countryCode'],
    'L’adresse de facturation'
  )

  const countryCode = typeof address.countryCode === 'string'
    ? address.countryCode.toUpperCase()
    : ''

  if (
    !isValidBillingCountry(countryCode)
    || countryCode !== expectedCountryCode
  ) {
    throw new EnrollmentProfileError(
      'Le pays de l’adresse doit correspondre au pays de facturation du panier.',
      409,
      'BILLING_COUNTRY_MISMATCH'
    )
  }

  return {
    line1: cleanText(address.line1, {
      label: 'Adresse',
      required: true,
      maxLength: 160
    }),
    line2: cleanText(address.line2, {
      label: 'Complément d’adresse',
      maxLength: 160
    }),
    postalCode: cleanText(address.postalCode, {
      label: 'Code postal',
      required: true,
      maxLength: 24
    }),
    city: cleanText(address.city, {
      label: 'Ville',
      required: true,
      maxLength: 100
    }),
    countryCode
  }
}

function sanitizeStudents(students, quoteItems, now) {
  if (!Array.isArray(students) || students.length !== quoteItems.length) {
    throw new EnrollmentProfileError(
      'Une fiche élève est requise pour chaque inscription.'
    )
  }

  const studentsByCartItemId = new Map()
  const quoteItemsByCartItemId = new Map(
    quoteItems.map((item) => [item.cartItemId, item])
  )

  for (const student of students) {
    const quoteItem = quoteItemsByCartItemId.get(student?.cartItemId)
    const isSummerCamp = quoteItem?.planId === 'summerCamp'
    const workshop = isSummerCamp ? getSummerCampWorkshop(quoteItem) : null
    const allowedKeys = isSummerCamp
      ? workshop === 'Ateliers religieux'
        ? [
            'cartItemId',
            'firstName',
            'lastName',
            'age',
            'arabicLevel',
            'quranLevel'
          ]
        : ['cartItemId', 'firstName', 'lastName', 'age', 'schoolGrade']
      : [
          'cartItemId',
          'firstName',
          'lastName',
          'birthDate',
          'schoolingStatus',
          'learningObjectives',
          'accommodations'
        ]

    assertAllowedKeys(
      student,
      allowedKeys,
      'La fiche élève'
    )

    if (
      typeof student.cartItemId !== 'string'
      || !quoteItem
      || studentsByCartItemId.has(student.cartItemId)
    ) {
      throw new EnrollmentProfileError(
        'Les fiches élèves ne correspondent pas aux inscriptions du panier.'
      )
    }

    const identity = {
      cartItemId: student.cartItemId,
      firstName: cleanText(student.firstName, {
        label: 'Prénom de l’élève',
        required: true,
        maxLength: 80
      }),
      lastName: cleanText(student.lastName, {
        label: 'Nom de l’élève',
        required: true,
        maxLength: 80
      })
    }

    if (isSummerCamp) {
      const age = cleanAge(student.age)

      if (workshop === 'Ateliers religieux') {
        if (
          !ARABIC_LEVELS.has(student.arabicLevel)
          || !QURAN_LEVELS.has(student.quranLevel)
        ) {
          throw new EnrollmentProfileError(
            'Les niveaux d’arabe et de mémorisation du Coran sont obligatoires.'
          )
        }

        studentsByCartItemId.set(student.cartItemId, {
          ...identity,
          age,
          workshop: 'religieux',
          arabicLevel: student.arabicLevel,
          quranLevel: student.quranLevel
        })
        continue
      }

      const allowedGrades = quoteItem.summerCampLevelId === 'adolescents'
        ? ADOLESCENT_GRADES
        : PRIMARY_GRADES

      if (!allowedGrades.has(student.schoolGrade)) {
        throw new EnrollmentProfileError('La classe actuelle est invalide.')
      }

      studentsByCartItemId.set(student.cartItemId, {
        ...identity,
        age,
        workshop: 'academiques',
        schoolGrade: student.schoolGrade
      })
      continue
    }

    if (!SCHOOLING_STATUSES.has(student.schoolingStatus)) {
      throw new EnrollmentProfileError('La situation scolaire est invalide.')
    }

    studentsByCartItemId.set(student.cartItemId, {
      ...identity,
      birthDate: cleanBirthDate(student.birthDate, now),
      schoolingStatus: student.schoolingStatus,
      learningObjectives: cleanText(student.learningObjectives, {
        label: 'Objectifs pédagogiques',
        required: true,
        maxLength: 1200,
        multiline: true
      }),
      accommodations: cleanText(student.accommodations, {
        label: 'Aménagements',
        maxLength: 1200,
        multiline: true
      })
    })
  }

  return quoteItems.map((item) => {
    const student = studentsByCartItemId.get(item.cartItemId)

    if (!student) {
      throw new EnrollmentProfileError(
        'Une fiche élève ne correspond à aucune inscription.'
      )
    }

    return {
      ...student,
      // Ces références sont reprises du devis serveur, jamais du formulaire.
      offerId: item.offerId,
      curriculum: item.curriculum,
      grade: item.grade
    }
  })
}

function sanitizeConsents(consents, acceptedAt) {
  assertAllowedKeys(
    consents,
    Object.keys(enrollmentConsentVersions),
    'Les consentements'
  )

  return Object.fromEntries(
    Object.entries(enrollmentConsentVersions).map(([name, version]) => {
      const consent = consents[name]
      assertAllowedKeys(consent, ['accepted', 'version'], 'Le consentement')

      if (consent.accepted !== true || consent.version !== version) {
        throw new EnrollmentProfileError(
          'Tous les consentements requis doivent être acceptés dans leur version actuelle.',
          409,
          'CONSENT_REQUIRED'
        )
      }

      return [name, { accepted: true, version, acceptedAt }]
    })
  )
}

// Le serveur reconstruit les liens entre élèves et offres depuis le devis. Les
// informations personnelles restent dans la commande et ne sont jamais copiées
// dans les métadonnées Stripe.
export function sanitizeEnrollmentProfile({
  enrollment,
  quote,
  now = () => new Date().toISOString()
}) {
  assertAllowedKeys(
    enrollment,
    ['guardian', 'billingAddress', 'students', 'consents'],
    'Le dossier d’inscription'
  )

  const expectedCountryCode = quote.items[0]?.billingCountry
  const acceptedAt = now()

  return {
    schemaVersion: 'enrollment-profile-v2',
    guardian: sanitizeGuardian(enrollment.guardian),
    billingAddress: sanitizeBillingAddress(
      enrollment.billingAddress,
      expectedCountryCode
    ),
    students: sanitizeStudents(enrollment.students, quote.items, acceptedAt),
    consents: sanitizeConsents(enrollment.consents, acceptedAt),
    submittedAt: acceptedAt
  }
}

export { EnrollmentProfileError }
