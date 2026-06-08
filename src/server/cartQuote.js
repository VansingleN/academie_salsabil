import {
  getOffer,
  getOfferFields,
  resolveCartItem
} from '../data/offerCatalog.js'

const MAX_CART_ITEMS = 20
const MAX_IDENTIFIER_LENGTH = 160

class CartQuoteError extends Error {
  constructor(message, status = 400, code = 'INVALID_CART') {
    super(message)
    this.name = 'CartQuoteError'
    this.status = status
    this.code = code
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function validateIdentifier(value, label) {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value.length > MAX_IDENTIFIER_LENGTH
  ) {
    throw new CartQuoteError(`${label} est invalide.`)
  }
}

function sanitizeSelections(offer, selections) {
  if (!isPlainObject(selections)) {
    throw new CartQuoteError('Les options d’une inscription sont invalides.')
  }

  const fields = getOfferFields(offer)
  const allowedNames = new Set(fields.map((field) => field.name))
  const unexpectedName = Object.keys(selections).find((name) => !allowedNames.has(name))

  if (unexpectedName) {
    throw new CartQuoteError(`L’option « ${unexpectedName} » n’est pas autorisée.`)
  }

  const sanitizedSelections = {}

  for (const field of fields) {
    const value = selections[field.name]

    if (field.required && !value) {
      throw new CartQuoteError(`Le champ « ${field.label} » est obligatoire.`)
    }

    if (!value) continue

    const choiceExists = field.choices.some((choice) => choice.value === value)
    if (!choiceExists) {
      throw new CartQuoteError(`La valeur choisie pour « ${field.label} » est invalide.`)
    }

    sanitizedSelections[field.name] = value
  }

  if (
    sanitizedSelections.lv3
    && sanitizedSelections.lv3 !== 'none'
    && sanitizedSelections.lv2 === sanitizedSelections.lv3
  ) {
    throw new CartQuoteError('La LV2 et la LV3 doivent être différentes.')
  }

  return sanitizedSelections
}

function sanitizeCartItem(item, index) {
  if (!isPlainObject(item)) {
    throw new CartQuoteError(`L’inscription ${index + 1} est invalide.`)
  }

  validateIdentifier(item.cartItemId, 'L’identifiant du panier')
  validateIdentifier(item.offerId, 'L’identifiant de l’offre')

  const offer = getOffer(item.offerId)
  if (!offer) {
    throw new CartQuoteError(`L’offre « ${item.offerId} » n’existe pas.`)
  }

  return {
    cartItemId: item.cartItemId,
    offerId: item.offerId,
    selections: sanitizeSelections(offer, item.selections ?? {})
  }
}

function buildGroupedTotals(items) {
  return items.reduce((totals, item) => {
    totals[item.planId] = (totals[item.planId] ?? 0) + item.totalAmount
    return totals
  }, {})
}

// Point d’entrée métier commun à Netlify et au serveur local Vite.
// Aucune donnée tarifaire reçue du navigateur n’est lue ou recopiée.
export function createCartQuote(payload) {
  if (!isPlainObject(payload) || !Array.isArray(payload.items)) {
    throw new CartQuoteError('Le panier transmis est invalide.')
  }

  if (payload.items.length === 0) {
    throw new CartQuoteError('Le panier est vide.')
  }

  if (payload.items.length > MAX_CART_ITEMS) {
    throw new CartQuoteError(`Le panier ne peut pas dépasser ${MAX_CART_ITEMS} inscriptions.`)
  }

  const sanitizedItems = payload.items.map(sanitizeCartItem)
  const resolvedItems = sanitizedItems.map(resolveCartItem)

  return {
    valid: true,
    currency: 'EUR',
    taxMode: 'exclusive',
    itemCount: resolvedItems.length,
    items: resolvedItems.map((item) => ({
      cartItemId: item.cartItemId,
      offerId: item.id,
      curriculum: item.curriculum,
      grade: item.gradeLongLabel,
      planId: item.planId,
      plan: item.plan,
      period: item.period,
      billingMode: item.billingMode,
      interval: item.interval,
      intervalCount: item.intervalCount,
      installmentCount: item.installmentCount,
      baseAmount: item.amount,
      optionAmount: item.optionAmount,
      totalAmount: item.totalAmount,
      applicationFee: item.applicationFee,
      deposit: item.deposit,
      selectedOptions: item.selectedOptions
    })),
    groupedTotals: buildGroupedTotals(resolvedItems),
    // Un identifiant de devis persistant sera ajouté avec Stripe ou une base de données.
    quotedAt: new Date().toISOString()
  }
}

export { CartQuoteError }
