import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CART_UPDATED_EVENT,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem
} from '../utils/cart'
import {
  getOffer,
  getOfferFields,
  getGradeChoices,
  getOfferId,
  getPlanChoices,
  normalizeOfferSelections,
  resolveCartItem,
  validateOfferSelections
} from '../data/offerCatalog'
import { formatEuro } from '../utils/pricing'
import { requestCartQuote } from '../utils/cartQuoteApi'
import { requestCheckoutSession } from '../utils/checkoutApi'
import './CartPage.css'

// Un éditeur correspond à une inscription. Il garde un état local pour rendre
// les sélecteurs réactifs, puis répercute chaque changement dans localStorage.
function CartItemEditor({ item, onChange, onRemove }) {
  const offer = getOffer(item.offerId)
  const fields = getOfferFields(offer)
  const gradeChoices = getGradeChoices(offer?.curriculumId)
  const planChoices = getPlanChoices()
  const [selections, setSelections] = useState(item.selections)
  const resolvedItem = resolveCartItem({ ...item, selections })
  const isValid = validateOfferSelections(offer, selections)

  const handleSelectionChange = (fieldName, value) => {
    const nextSelections = { ...selections, [fieldName]: value }

    // Si la langue choisie existe déjà dans l'autre sélecteur, LV3 est réinitialisée.
    if (
      (fieldName === 'lv2' && nextSelections.lv3 === value)
      || (fieldName === 'lv3' && value !== 'none' && nextSelections.lv2 === value)
    ) {
      nextSelections.lv3 = 'none'
    }

    setSelections(nextSelections)
    onChange(item.cartItemId, nextSelections)
  }

  const handleOfferChange = (gradeId, planId) => {
    const offerId = getOfferId(offer.curriculumId, gradeId, planId)
    const nextOffer = getOffer(offerId)
    // Certains champs changent selon la classe (ex. arabe en 6e, LV2/LV3 dès la 5e).
    const nextSelections = normalizeOfferSelections(nextOffer, selections)

    setSelections(nextSelections)
    onChange(item.cartItemId, nextSelections, offerId)
  }

  if (!resolvedItem) return null

  return (
    <article className="cart-item">
      <header className="cart-item-header">
        <div>
          <span>{resolvedItem.curriculum}</span>
          <h2>{resolvedItem.gradeLongLabel}</h2>
          <p>Formule {resolvedItem.plan}</p>
        </div>
        <strong>{formatEuro(resolvedItem.totalAmount)}</strong>
      </header>

      <div className="cart-item-fields">
        <label htmlFor={`${item.cartItemId}-grade`}>
          <span>Classe</span>
          <select
            id={`${item.cartItemId}-grade`}
            name="grade"
            value={offer.gradeId}
            onChange={(event) => handleOfferChange(event.target.value, offer.planId)}
          >
            {gradeChoices.map((choice) => (
              <option key={choice.value} value={choice.value}>{choice.label}</option>
            ))}
          </select>
        </label>

        <label htmlFor={`${item.cartItemId}-plan`}>
          <span>Formule</span>
          <select
            id={`${item.cartItemId}-plan`}
            name="plan"
            value={offer.planId}
            onChange={(event) => handleOfferChange(offer.gradeId, event.target.value)}
          >
            {planChoices.map((choice) => (
              <option key={choice.value} value={choice.value}>{choice.label}</option>
            ))}
          </select>
        </label>

        {fields.map((field) => {
          const fieldId = `${item.cartItemId}-${field.name}`

          return (
          <label htmlFor={fieldId} key={field.name}>
            <span>{field.label}</span>
            <select
              id={fieldId}
              name={field.name}
              value={selections[field.name] ?? ''}
              required={field.required}
              onChange={(event) => handleSelectionChange(field.name, event.target.value)}
            >
              {field.required && <option value="">Choisir</option>}
              {field.choices.map((choice) => (
                <option
                  key={choice.value}
                  value={choice.value}
                  disabled={
                    (field.name === 'lv2' && selections.lv3 === choice.value)
                    || (field.name === 'lv3' && selections.lv2 === choice.value)
                  }
                >
                  {choice.label}
                </option>
              ))}
            </select>
          </label>
          )
        })}
      </div>

      <div className="cart-item-breakdown">
        <span>Tarif de la formule <strong>{formatEuro(resolvedItem.amount)}</strong></span>
        {resolvedItem.optionAmount > 0 && (
          <span>Options <strong>+ {formatEuro(resolvedItem.optionAmount)}</strong></span>
        )}
        <span>{resolvedItem.period}</span>
      </div>

      {!isValid && <p className="cart-item-error">Veuillez compléter les choix de cette inscription.</p>}

      <footer>
        <Link to={resolvedItem.curriculumPath}>Voir le cursus</Link>
        <button type="button" onClick={() => onRemove(item.cartItemId)}>
          Supprimer
        </button>
      </footer>
    </article>
  )
}

function CartPage() {
  const [cart, setCart] = useState(getCart)
  const [serverQuote, setServerQuote] = useState(null)
  const [quoteStatus, setQuoteStatus] = useState('idle')
  const [quoteError, setQuoteError] = useState('')
  const [quoteFingerprint, setQuoteFingerprint] = useState('')
  const [quoteRequestVersion, setQuoteRequestVersion] = useState(0)
  const [checkoutStatus, setCheckoutStatus] = useState('idle')
  const [checkoutError, setCheckoutError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // CustomEvent synchronise l'onglet courant ; storage couvre les autres onglets.
    const refreshCart = () => setCart(getCart())
    window.addEventListener(CART_UPDATED_EVENT, refreshCart)
    window.addEventListener('storage', refreshCart)

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshCart)
      window.removeEventListener('storage', refreshCart)
    }
  }, [])

  const resolvedItems = useMemo(
    () => cart.map(resolveCartItem).filter(Boolean),
    [cart]
  )
  // Les rythmes de paiement ne s'additionnent pas entre eux : chacun a son total.
  const groupedTotals = useMemo(
    () => resolvedItems.reduce((totals, item) => {
      totals[item.planId] = (totals[item.planId] ?? 0) + item.totalAmount
      return totals
    }, {}),
    [resolvedItems]
  )
  const hasInvalidItem = cart.some((item) =>
    !validateOfferSelections(getOffer(item.offerId), item.selections)
  )
  // L'empreinte empêche une réponse lente d'un ancien panier de remplacer le devis courant.
  const cartFingerprint = JSON.stringify(cart)

  useEffect(() => {
    if (cart.length === 0 || hasInvalidItem) {
      return undefined
    }

    const controller = new AbortController()

    // Un court délai évite plusieurs requêtes pendant une succession rapide de choix.
    const timeoutId = window.setTimeout(async () => {
      setQuoteFingerprint(cartFingerprint)
      setQuoteStatus('loading')
      setQuoteError('')

      try {
        const quote = await requestCartQuote(cart, { signal: controller.signal })
        setServerQuote({ ...quote, cartFingerprint })
        setQuoteStatus('success')
      } catch (error) {
        if (error.name === 'AbortError') return

        setServerQuote(null)
        setQuoteStatus('error')
        setQuoteError(error.message)
      }
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [cart, cartFingerprint, hasInvalidItem, quoteRequestVersion])

  const handleChange = (cartItemId, selections, offerId) => {
    updateCartItem(cartItemId, { selections, offerId })
  }

  const handleRemove = (cartItemId) => {
    removeCartItem(cartItemId)
  }

  const handleCheckout = async () => {
    setCheckoutStatus('loading')
    setCheckoutError('')

    try {
      const checkout = await requestCheckoutSession(cart)
      // Stripe héberge le formulaire bancaire : aucune donnée de carte ne touche notre site.
      window.location.assign(checkout.checkoutUrl)
    } catch (error) {
      setCheckoutStatus('error')
      setCheckoutError(error.message)
    }
  }

  const quoteMatchesCart = serverQuote?.cartFingerprint === cartFingerprint
  const quoteRequestMatchesCart = quoteFingerprint === cartFingerprint
  const displayedQuoteStatus = hasInvalidItem
    ? 'idle'
    : quoteRequestMatchesCart
      ? quoteStatus
      : 'idle'
  // Les totaux serveur remplacent les calculs d'aperçu uniquement pour ce panier précis.
  const displayedTotals = quoteMatchesCart ? serverQuote.groupedTotals : groupedTotals
  const billingPlanCount = serverQuote
    ? new Set(serverQuote.items.map((item) => item.planId)).size
    : 0
  const hasMixedBillingPlans = quoteMatchesCart && billingPlanCount > 1
  const canStartCheckout = (
    displayedQuoteStatus === 'success'
    && quoteMatchesCart
    && !hasMixedBillingPlans
    && checkoutStatus !== 'loading'
  )

  if (cart.length === 0) {
    return (
      <main className="cart-page cart-page--empty">
        <span className="cart-page-eyebrow">Panier invité</span>
        <h1>Votre panier est vide</h1>
        <p>Choisissez un niveau et une formule pour préparer une inscription.</p>
        <button type="button" onClick={() => navigate('/')}>Découvrir les cursus</button>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <header className="cart-page-heading">
        <div>
          <span className="cart-page-eyebrow">Panier invité</span>
          <h1>Votre projet d’inscription</h1>
        </div>
        <p>
          Vérifiez les classes, formules et options. Le paiement sera ajouté lors de
          la prochaine étape technique.
        </p>
      </header>

      <div className="cart-layout">
        <section className="cart-items" aria-label="Inscriptions dans le panier">
          {cart.map((item) => (
            <CartItemEditor
              key={item.cartItemId}
              item={item}
              onChange={handleChange}
              onRemove={handleRemove}
            />
          ))}
        </section>

        <aside className="cart-summary">
          <span>Récapitulatif</span>
          <h2>{cart.length} inscription{cart.length > 1 ? 's' : ''}</h2>

          <div className="cart-summary-totals" aria-busy={displayedQuoteStatus === 'loading'}>
            {displayedTotals.monthly && (
              <p><span>Total mensuel</span><strong>{formatEuro(displayedTotals.monthly)} HT</strong></p>
            )}
            {displayedTotals.quarterly && (
              <p><span>Total trimestriel</span><strong>{formatEuro(displayedTotals.quarterly)} HT</strong></p>
            )}
            {displayedTotals.annual && (
              <p><span>Total annuel</span><strong>{formatEuro(displayedTotals.annual)} HT</strong></p>
            )}
          </div>

          <div
            className={`cart-quote-status cart-quote-status--${displayedQuoteStatus}`}
            role="status"
            aria-live="polite"
          >
            {hasInvalidItem && <p>Complétez toutes les inscriptions pour vérifier les tarifs.</p>}
            {!hasInvalidItem && displayedQuoteStatus === 'idle' && <p>Préparation de la vérification…</p>}
            {displayedQuoteStatus === 'loading' && <p>Vérification sécurisée des tarifs…</p>}
            {displayedQuoteStatus === 'success' && quoteMatchesCart && (
              <p><strong>Tarifs vérifiés par le serveur</strong>Le devis correspond au catalogue actuel.</p>
            )}
            {displayedQuoteStatus === 'error' && (
              <>
                <p><strong>Vérification indisponible</strong>{quoteError}</p>
                <button type="button" onClick={() => setQuoteRequestVersion((version) => version + 1)}>
                  Réessayer
                </button>
              </>
            )}
          </div>

          <div className="cart-summary-note">
            <strong>Checkout en mode test</strong>
            <p>
              Aucune carte ne sera débitée. Les durées d’abonnement, acomptes, frais
              de dossier et taxes restent à valider avant la production.
            </p>
          </div>

          {hasMixedBillingPlans && (
            <p className="cart-checkout-warning">
              Pour ce premier test, choisissez la même formule pour toutes les
              inscriptions avant de continuer.
            </p>
          )}

          {checkoutStatus === 'error' && (
            <p className="cart-checkout-error" role="alert">{checkoutError}</p>
          )}

          {/* La fonction serveur recalcule encore le panier avant de contacter Stripe. */}
          <button type="button" disabled={!canStartCheckout} onClick={handleCheckout}>
            {hasInvalidItem
              ? 'Complétez vos inscriptions'
              : displayedQuoteStatus === 'loading'
                ? 'Vérification en cours'
                : hasMixedBillingPlans
                  ? 'Harmonisez les formules'
                  : checkoutStatus === 'loading'
                    ? 'Ouverture de Stripe…'
                    : displayedQuoteStatus === 'success'
                      ? 'Tester le paiement Stripe'
                      : 'Paiement indisponible'}
          </button>
          <button className="cart-clear-button" type="button" onClick={clearCart}>
            Vider le panier
          </button>
        </aside>
      </div>
    </main>
  )
}

export default CartPage
