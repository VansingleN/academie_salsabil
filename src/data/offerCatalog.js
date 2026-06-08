import { buildPricingPlans } from '../utils/pricing.js'

// Ces paramètres décrivent le futur mode de facturation Stripe. Les nombres
// d'échéances restent volontairement configurables tant que les règles ne sont pas figées.
const planConfiguration = {
  monthly: {
    billingMode: 'subscription',
    interval: 'month',
    intervalCount: 1,
    installmentCount: null
  },
  quarterly: {
    billingMode: 'subscription',
    interval: 'month',
    intervalCount: 3,
    installmentCount: null
  },
  annual: {
    billingMode: 'one_time',
    interval: null,
    intervalCount: null,
    installmentCount: 1
  }
}

// Source de vérité commerciale du front : tarifs, frais préparatoires et options.
// Pour modifier un prix affiché sur le site et dans le panier, intervenir ici uniquement.
const curricula = {
  preschool: {
    name: 'Maternelle',
    path: '/maternelle',
    fees: { monthly: 70, quarterly: 45, annual: 0 },
    grades: {
      ps: { label: 'Petite section', shortLabel: 'PS', prices: { monthly: 289, quarterly: 915, annual: 2600 } },
      ms: { label: 'Moyenne section', shortLabel: 'MS', prices: { monthly: 309, quarterly: 980, annual: 2780 } },
      gs: { label: 'Grande section', shortLabel: 'GS', prices: { monthly: 329, quarterly: 1040, annual: 2960 } }
    }
  },
  primary: {
    name: 'Primaire',
    path: '/primaire',
    fees: { monthly: 90, quarterly: 60, annual: 0 },
    grades: {
      cp: { label: 'CP', prices: { monthly: 329, quarterly: 1040, annual: 2960 } },
      ce1: { label: 'CE1', prices: { monthly: 339, quarterly: 1075, annual: 3050 } },
      ce2: { label: 'CE2', prices: { monthly: 349, quarterly: 1100, annual: 3140 } },
      cm1: { label: 'CM1', prices: { monthly: 369, quarterly: 1165, annual: 3320 } },
      cm2: { label: 'CM2', prices: { monthly: 389, quarterly: 1230, annual: 3500 } }
    },
    options: {
      arabicLanguage: {
        label: 'Langue arabe',
        prices: { monthly: 15, quarterly: 40, annual: 130 }
      }
    }
  },
  college: {
    name: 'Collège',
    path: '/college',
    fees: { monthly: 110, quarterly: 80, annual: 0 },
    grades: {
      '6e': { label: '6e', prices: { monthly: 449, quarterly: 1420, annual: 4040 } },
      '5e': { label: '5e', prices: { monthly: 459, quarterly: 1455, annual: 4130 } },
      '4e': { label: '4e', prices: { monthly: 469, quarterly: 1485, annual: 4220 } },
      '3e': { label: '3e', prices: { monthly: 489, quarterly: 1545, annual: 4400 } }
    },
    options: {
      arabicLanguage: {
        label: 'Langue arabe',
        grades: ['6e'],
        prices: { monthly: 20, quarterly: 55, annual: 180 }
      },
      lv3: {
        label: 'LV3',
        grades: ['5e', '4e', '3e'],
        prices: { monthly: 20, quarterly: 55, annual: 180 }
      }
    }
  },
  highSchool: {
    name: 'Lycée',
    path: '/lycee',
    fees: { monthly: 130, quarterly: 90, annual: 0 },
    grades: {
      seconde: { label: 'Seconde', prices: { monthly: 529, quarterly: 1675, annual: 4760 } },
      premiere: { label: 'Première', prices: { monthly: 569, quarterly: 1800, annual: 5120 } },
      terminale: { label: 'Terminale', prices: { monthly: 599, quarterly: 1895, annual: 5390 } }
    },
    options: {
      lv3: {
        label: 'LV3',
        prices: { monthly: 25, quarterly: 70, annual: 220 }
      }
    }
  }
}

// Les identifiants techniques restent en anglais et stables ; les libellés peuvent évoluer.
const planLabels = {
  monthly: { name: 'Mensuel', period: 'HT / mois' },
  quarterly: { name: 'Trimestriel', period: 'HT / trimestre' },
  annual: { name: 'Annuel', period: 'HT / année scolaire' }
}

const timeSlotChoices = [
  { value: 'morning', label: 'Matin' },
  { value: 'afternoon', label: 'Après-midi' }
]

const languageChoices = [
  { value: 'spanish', label: 'Espagnol' },
  { value: 'arabic', label: 'Arabe' }
]

export function getOfferId(curriculumId, gradeId, planId) {
  return `${curriculumId}-${gradeId}-${planId}`
}

// Fournit aux pages de cursus les données nécessaires aux cartes tarifaires existantes.
export function getCurriculumPricing(curriculumId, gradeId) {
  const curriculum = curricula[curriculumId]
  const grade = curriculum?.grades[gradeId]

  if (!curriculum || !grade) return null

  return {
    pricing: grade.prices,
    fees: curriculum.fees
  }
}

export function getPricingPlans(curriculumId, gradeId) {
  const configuration = getCurriculumPricing(curriculumId, gradeId)
  return configuration
    ? buildPricingPlans(configuration.pricing, configuration.fees)
    : []
}

export function getOptionPrice(curriculumId, optionId, planId) {
  return curricula[curriculumId]?.options?.[optionId]?.prices?.[planId] ?? 0
}

// Reconstitue une offre complète à partir du seul identifiant stocké dans le panier.
// Ainsi, aucun montant provenant de localStorage n'est considéré comme fiable.
export function getOffer(offerId) {
  const match = Object.entries(curricula).find(([curriculumId, curriculum]) =>
    Object.keys(curriculum.grades).some((gradeId) =>
      Object.keys(planLabels).some((planId) =>
        getOfferId(curriculumId, gradeId, planId) === offerId
      )
    )
  )

  if (!match) return null

  const [curriculumId, curriculum] = match
  const gradeId = Object.keys(curriculum.grades).find((candidateGradeId) =>
    Object.keys(planLabels).some((planId) =>
      getOfferId(curriculumId, candidateGradeId, planId) === offerId
    )
  )
  const planId = Object.keys(planLabels).find((candidatePlanId) =>
    getOfferId(curriculumId, gradeId, candidatePlanId) === offerId
  )
  const grade = curriculum.grades[gradeId]

  return {
    id: offerId,
    curriculumId,
    curriculum: curriculum.name,
    curriculumPath: curriculum.path,
    gradeId,
    grade: grade.shortLabel ?? grade.label,
    gradeLongLabel: grade.label,
    planId,
    plan: planLabels[planId].name,
    period: planLabels[planId].period,
    amount: grade.prices[planId],
    // Les montants sont déjà prévus, mais restent désactivés jusqu'à validation commerciale.
    applicationFee: {
      enabled: false,
      amount: curriculum.fees[planId] ?? 0
    },
    deposit: { enabled: false, amount: 0 },
    ...planConfiguration[planId]
  }
}

// Définit dynamiquement les champs modifiables selon le cursus et la classe.
export function getOfferFields(offer) {
  if (!offer) return []

  const fields = [
    {
      name: 'timeSlot',
      label: 'Tranche horaire',
      required: true,
      choices: timeSlotChoices
    }
  ]

  if (offer.curriculumId === 'primary' || (offer.curriculumId === 'college' && offer.gradeId === '6e')) {
    fields.push({
      name: 'arabicLanguage',
      label: 'Langue arabe',
      choices: [
        { value: 'none', label: 'Sans langue arabe' },
        { value: 'arabic', label: 'Avec langue arabe' }
      ]
    })
  }

  if (
    offer.curriculumId === 'highSchool'
    || (offer.curriculumId === 'college' && offer.gradeId !== '6e')
  ) {
    fields.push(
      { name: 'lv2', label: 'LV2', required: true, choices: languageChoices },
      {
        name: 'lv3',
        label: 'LV3',
        choices: [{ value: 'none', label: 'Aucune LV3' }, ...languageChoices]
      }
    )
  }

  return fields
}

export function getGradeChoices(curriculumId) {
  const curriculum = curricula[curriculumId]
  if (!curriculum) return []

  return Object.entries(curriculum.grades).map(([value, grade]) => ({
    value,
    label: grade.label
  }))
}

export function getPlanChoices() {
  return Object.entries(planLabels).map(([value, plan]) => ({
    value,
    label: plan.name
  }))
}

export function normalizeOfferSelections(offer, selections = {}) {
  // Lors d'un changement de classe, on conserve uniquement les choix encore valides.
  return Object.fromEntries(getOfferFields(offer).map((field) => {
    const currentValue = selections[field.name]
    const valueIsAvailable = field.choices.some((choice) => choice.value === currentValue)
    const fallbackValue = field.choices.some((choice) => choice.value === 'none') ? 'none' : ''

    return [field.name, valueIsAvailable ? currentValue : fallbackValue]
  }))
}

function getOptionAmount(offer, selections) {
  const options = curricula[offer.curriculumId].options ?? {}

  return Object.entries(options).reduce((total, [optionId, option]) => {
    if (option.grades && !option.grades.includes(offer.gradeId)) return total

    const isSelected = optionId === 'arabicLanguage'
      ? selections.arabicLanguage === 'arabic'
      : selections[optionId] && selections[optionId] !== 'none'

    return isSelected ? total + option.prices[offer.planId] : total
  }, 0)
}

// Enrichit un article minimal du panier avec ses libellés et montants calculés.
// Cette fonction sera réutilisable côté serveur lors de la sécurisation Netlify.
export function resolveCartItem(cartItem) {
  const offer = getOffer(cartItem.offerId)
  if (!offer) return null

  const selections = cartItem.selections ?? {}
  const optionAmount = getOptionAmount(offer, selections)
  const selectedOptions = getOfferFields(offer)
    .filter((field) => selections[field.name])
    .map((field) => {
      const choice = field.choices.find((item) => item.value === selections[field.name])
      return choice && choice.value !== 'none'
        ? { name: field.name, label: field.label, value: choice.label }
        : null
    })
    .filter(Boolean)

  return {
    ...cartItem,
    ...offer,
    selections,
    optionAmount,
    totalAmount: offer.amount + optionAmount,
    selectedOptions
  }
}

export function validateOfferSelections(offer, selections) {
  if (!offer) return false

  const fields = getOfferFields(offer)
  const requiredFieldsAreFilled = fields.every(
    (field) => !field.required || Boolean(selections[field.name])
  )
  // Une même langue ne peut pas être sélectionnée simultanément en LV2 et LV3.
  const languagesAreDifferent = !selections.lv3
    || selections.lv3 === 'none'
    || selections.lv2 !== selections.lv3

  return requiredFieldsAreFilled && languagesAreDifferent
}

export { curricula as offerCatalog }
