import assert from 'node:assert/strict'
import validateCart from '../netlify/functions/validate-cart.mjs'
import {
  CartQuoteError,
  createCartQuote
} from '../src/server/cartQuote.js'

// Cas nominal : le serveur retrouve lui-même les 329 € et le supplément de 15 €.
const quote = createCartQuote({
  items: [{
    cartItemId: 'test-primary-cp',
    offerId: 'primary-cp-monthly',
    selections: {
      billingCountry: 'FR',
      timeSlot: 'morning',
      arabicLanguage: 'arabic'
    }
  }]
})

assert.equal(quote.items[0].baseAmount, 329)
assert.equal(quote.items[0].optionAmount, 15)
assert.equal(quote.groupedTotals.monthly, 344)
assert.equal(quote.items[0].paymentSchedule.installmentCount, 10)
assert.equal(quote.paymentSummary.firstPaymentExcludingTax, 434)
assert.equal(quote.paymentSummary.contractTotalExcludingTax, 3530)

// Le pays est requis dès la modale afin de préparer le futur calcul fiscal.
assert.throws(
  () => createCartQuote({
    items: [{
      cartItemId: 'test-missing-country',
      offerId: 'primary-cp-monthly',
      selections: {
        timeSlot: 'morning',
        arabicLanguage: 'none'
      }
    }]
  }),
  CartQuoteError
)

// Un montant injecté par le navigateur doit être rejeté, même s'il semble numérique.
assert.throws(
  () => createCartQuote({
    items: [{
      cartItemId: 'test-injected-price',
      offerId: 'primary-cp-monthly',
      selections: {
        billingCountry: 'FR',
        timeSlot: 'morning',
        arabicLanguage: 'arabic',
        price: 1
      }
    }]
  }),
  CartQuoteError
)

// Chaque ligne doit conserver un identifiant unique, car Stripe l'utilise
// pour rendre la création de son Price récurrent idempotente.
assert.throws(
  () => createCartQuote({
    items: [
      {
        cartItemId: 'test-duplicate-cart-item',
        offerId: 'primary-cp-monthly',
        selections: {
          billingCountry: 'FR',
          timeSlot: 'morning',
          arabicLanguage: 'none'
        }
      },
      {
        cartItemId: 'test-duplicate-cart-item',
        offerId: 'primary-ce1-monthly',
        selections: {
          billingCountry: 'FR',
          timeSlot: 'afternoon',
          arabicLanguage: 'none'
        }
      }
    ]
  }),
  (error) => error.code === 'DUPLICATE_CART_ITEM_ID'
)

// Après la veille de la rentrée, l'annuel reste visible mais le serveur le refuse.
assert.throws(
  () => createCartQuote({
    items: [{
      cartItemId: 'test-annual-after-deadline',
      offerId: 'preschool-ps-annual',
      selections: {
        billingCountry: 'FR',
        timeSlot: 'morning'
      }
    }]
  }, { enrollmentDate: '2026-09-01' }),
  (error) => error.code === 'PLAN_UNAVAILABLE'
)

// Les contraintes métier sont également rejouées côté serveur.
assert.throws(
  () => createCartQuote({
    items: [{
      cartItemId: 'test-duplicate-language',
      offerId: 'highSchool-terminale-annual',
      selections: {
        billingCountry: 'FR',
        timeSlot: 'morning',
        lv2: 'arabic',
        lv3: 'arabic'
      }
    }]
  }),
  CartQuoteError
)

// Le dernier test traverse l'adaptateur HTTP réellement déployé par Netlify.
const response = await validateCart(new Request(
  'http://localhost/.netlify/functions/validate-cart',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        cartItemId: 'test-college-5e',
        offerId: 'college-5e-quarterly',
        selections: {
          billingCountry: 'BE',
          timeSlot: 'afternoon',
          lv2: 'spanish',
          lv3: 'arabic'
        }
      }]
    })
  }
))
const responsePayload = await response.json()

assert.equal(response.status, 200)
assert.equal(responsePayload.groupedTotals.quarterly, 1510)

console.log('Validation serveur du panier : tests réussis')
