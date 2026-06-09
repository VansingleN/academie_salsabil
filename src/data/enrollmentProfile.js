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
  { name: 'currentSchool', label: 'Établissement actuel', type: 'text' },
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
      birthDate: '',
      schoolingStatus: '',
      currentSchool: '',
      learningObjectives: '',
      accommodations: ''
    })),
    consents: Object.fromEntries(
      consentDefinitions.map((consent) => [
        consent.name,
        { accepted: false, version: consent.version }
      ])
    )
  }
}
