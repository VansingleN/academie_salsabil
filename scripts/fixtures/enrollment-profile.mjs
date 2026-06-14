import {
  enrollmentConsentVersions
} from '../../src/data/enrollmentProfile.js'

export function createEnrollmentProfile(
  cartItemIds,
  { countryCode = 'FR' } = {}
) {
  return {
    guardian: {
      firstName: '  Amira ',
      lastName: ' Benali  ',
      email: 'PARENT@EXAMPLE.COM',
      phone: '+33 6 12 34 56 78',
      relationship: 'mother'
    },
    billingAddress: {
      line1: '12 rue des Écoles',
      line2: '',
      postalCode: '75005',
      city: 'Paris',
      countryCode
    },
    students: cartItemIds.map((cartItemId, index) => ({
      cartItemId,
      firstName: index === 0 ? 'Yasmine' : 'Adam',
      lastName: 'Benali',
      birthDate: index === 0 ? '2018-03-15' : '2015-09-20',
      schoolingStatus: 'school_enrolled',
      learningObjectives: 'Renforcer les bases et gagner en autonomie.',
      accommodations: ''
    })),
    consents: Object.fromEntries(
      Object.entries(enrollmentConsentVersions).map(([name, version]) => [
        name,
        { accepted: true, version }
      ])
    )
  }
}
