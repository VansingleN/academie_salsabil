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
      timeSlot: 'morning',
      arabicLanguage: 'arabic'
    }
  }]
})

assert.equal(quote.items[0].baseAmount, 329)
assert.equal(quote.items[0].optionAmount, 15)
assert.equal(quote.groupedTotals.monthly, 344)

// Un montant injecté par le navigateur doit être rejeté, même s'il semble numérique.
assert.throws(
  () => createCartQuote({
    items: [{
      cartItemId: 'test-injected-price',
      offerId: 'primary-cp-monthly',
      selections: {
        timeSlot: 'morning',
        arabicLanguage: 'arabic',
        price: 1
      }
    }]
  }),
  CartQuoteError
)

// Les contraintes métier sont également rejouées côté serveur.
assert.throws(
  () => createCartQuote({
    items: [{
      cartItemId: 'test-duplicate-language',
      offerId: 'highSchool-terminale-annual',
      selections: {
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
