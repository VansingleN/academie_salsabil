// Les versions sont conservées avec la commande afin de savoir exactement
// quels textes ont été acceptés, même après une future mise à jour juridique.
export const enrollmentConsentVersions = {
  terms: 'cgv-2026-06-09',
  schedule: 'echeancier-2026-06-09',
  paymentMethod: 'mandat-paiement-2026-06-09'
}

// Cette configuration décrit le formulaire affiché au client. La validation de
// sécurité reste volontairement indépendante dans le module serveur.
export const guardianFields = [
  { name: 'firstName', label: 'Prénom', type: 'text', autoComplete: 'given-name', required: true },
  { name: 'lastName', label: 'Nom', type: 'text', autoComplete: 'family-name', required: true },
  { name: 'email', label: 'Adresse e-mail', type: 'email', autoComplete: 'email', required: true },
  { name: 'phone', label: 'Téléphone', type: 'tel', autoComplete: 'tel', required: true },
  {
    name: 'relationship',
    label: 'Lien avec l’élève',
    type: 'select',
    required: true,
    options: [
      { value: 'mother', label: 'Mère' },
      { value: 'father', label: 'Père' },
      { value: 'legal_guardian', label: 'Responsable légal' },
      { value: 'other', label: 'Autre' }
    ]
  }
]

export const billingAddressFields = [
  { name: 'line1', label: 'Adresse', type: 'text', autoComplete: 'address-line1', required: true },
  { name: 'line2', label: 'Complément d’adresse', type: 'text', autoComplete: 'address-line2' },
  { name: 'postalCode', label: 'Code postal', type: 'text', autoComplete: 'postal-code', required: true },
  { name: 'city', label: 'Ville', type: 'text', autoComplete: 'address-level2', required: true }
]

export const studentFields = [
  { name: 'firstName', label: 'Prénom de l’élève', type: 'text', required: true },
  { name: 'lastName', label: 'Nom de l’élève', type: 'text', required: true },
  { name: 'birthDate', label: 'Date de naissance', type: 'date', required: true },
  {
    name: 'schoolingStatus',
    label: 'Situation actuelle',
    type: 'select',
    required: true,
    options: [
      { value: 'school_enrolled', label: 'Scolarisé dans un établissement' },
      { value: 'home_instruction', label: 'Instruction en famille' },
      { value: 'not_enrolled', label: 'Non scolarisé actuellement' },
      { value: 'other', label: 'Autre situation' }
    ]
  },
  {
    name: 'learningObjectives',
    label: 'Objectifs pédagogiques',
    type: 'textarea',
    required: true,
    placeholder: 'Décrivez brièvement les besoins et objectifs prioritaires.'
  },
  {
    name: 'accommodations',
    label: 'Aménagements ou points d’attention',
    type: 'textarea',
    placeholder: 'DYS, rythme particulier, outils déjà utilisés…'
  }
]

const summerCampIdentityFields = [
  { name: 'firstName', label: 'Prénom de l’élève', type: 'text', required: true },
  { name: 'lastName', label: 'Nom de l’élève', type: 'text', required: true },
  {
    name: 'age',
    label: 'Âge de l’élève',
    type: 'number',
    min: 3,
    max: 18,
    required: true
  }
]

const summerCampAcademicFields = [
  ...summerCampIdentityFields,
  {
    name: 'schoolGrade',
    label: 'Classe actuelle',
    type: 'select',
    required: true,
    options: [
      { value: 'cp', label: 'CP' },
      { value: 'ce1', label: 'CE1' },
      { value: 'ce2', label: 'CE2' },
      { value: 'cm1', label: 'CM1' },
      { value: 'cm2', label: 'CM2' }
    ]
  }
]

const summerCampAdolescentAcademicFields = [
  ...summerCampIdentityFields,
  {
    name: 'schoolGrade',
    label: 'Classe actuelle',
    type: 'select',
    required: true,
    options: [
      { value: '6e', label: '6e' },
      { value: '5e', label: '5e' },
      { value: '4e', label: '4e' },
      { value: '3e', label: '3e' },
      { value: 'seconde', label: 'Seconde' }
    ]
  }
]

const summerCampReligiousFields = [
  ...summerCampIdentityFields,
  {
    name: 'arabicLevel',
    label: 'Niveau de langue arabe',
    type: 'select',
    required: true,
    options: [
      { value: '0', label: '0 - Débutant' },
      { value: '1', label: '1 - Alphabétisé' },
      { value: '2', label: '2 - Notions' },
      { value: '3', label: '3 - Intermédiaire' },
      { value: '4', label: '4 - Avancé' },
      { value: '5', label: '5 - Fluent' }
    ]
  },
  {
    name: 'quranLevel',
    label: 'Niveau de mémorisation du Coran',
    type: 'select',
    required: true,
    options: [
      { value: '0', label: '0 - Pas d’expérience' },
      { value: '1', label: '1 - Quelques sourates courtes' },
      { value: '2', label: '2 - Intermédiaire' },
      { value: '3', label: '3 - Avancé' }
    ]
  }
]

export function getStudentFields(item) {
  if (item?.offerType !== 'summerCamp') return studentFields

  if (item.selections?.workshop === 'religieux') {
    return summerCampReligiousFields
  }

  return item.summerCampLevelId === 'adolescents'
    ? summerCampAdolescentAcademicFields
    : summerCampAcademicFields
}

export const consentDefinitions = [
  {
    name: 'terms',
    version: enrollmentConsentVersions.terms,
    label: 'J’accepte les conditions générales de vente applicables à cette inscription.'
  },
  {
    name: 'schedule',
    version: enrollmentConsentVersions.schedule,
    label: 'J’ai lu et j’accepte le premier paiement ainsi que l’échéancier présenté dans le panier.'
  },
  {
    name: 'paymentMethod',
    version: enrollmentConsentVersions.paymentMethod,
    label: 'J’autorise l’enregistrement du moyen de paiement pour les échéances futures prévues.'
  }
]

export function createEnrollmentDraft(cart, billingCountry) {
  return {
    guardian: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      relationship: ''
    },
    billingAddress: {
      line1: '',
      line2: '',
      postalCode: '',
      city: '',
      countryCode: billingCountry ?? ''
    },
    students: cart.map((item) => ({
      cartItemId: item.cartItemId,
      firstName: '',
      lastName: '',
      ...(item.offerId?.startsWith('summerCamp-')
        ? item.selections?.workshop === 'religieux'
          ? { age: '', arabicLevel: '', quranLevel: '' }
          : { age: '', schoolGrade: '' }
        : {
            birthDate: '',
            schoolingStatus: '',
            learningObjectives: '',
            accommodations: ''
          })
    })),
    consents: Object.fromEntries(
      consentDefinitions.map((consent) => [
        consent.name,
        { accepted: false, version: consent.version }
      ])
    )
  }
}
