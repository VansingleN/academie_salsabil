import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  requestCheckoutVerification,
  requestCustomerPortal
} from '../utils/checkoutApi'
import './PaymentStatusPage.css'

function PaymentStatusPage({ status }) {
  const location = useLocation()
  const sessionId = new URLSearchParams(location.search).get('session_id')
  const isSuccess = status === 'success'
  const [verification, setVerification] = useState(
    isSuccess ? { state: 'loading' } : { state: 'cancelled' }
  )
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (!isSuccess) return

    if (!sessionId) {
      setVerification({
        state: 'error',
        message: 'Aucune session Stripe n’est indiquée dans cette adresse.'
      })
      return
    }

    let active = true

    requestCheckoutVerification(sessionId)
      .then((result) => {
        if (!active) return
        setVerification({
          state: result.confirmed ? 'confirmed' : 'pending',
          ...result
        })
      })
      .catch((error) => {
        if (!active) return
        setVerification({ state: 'error', message: error.message })
      })

    return () => {
      active = false
    }
  }, [isSuccess, sessionId])

  const openCustomerPortal = async () => {
    setPortalLoading(true)

    try {
      const portal = await requestCustomerPortal(sessionId)
      window.location.assign(portal.portalUrl)
    } catch (error) {
      setVerification((current) => ({
        ...current,
        portalMessage: error.message
      }))
      setPortalLoading(false)
    }
  }

  let eyebrow = 'Paiement interrompu'
  let title = 'Votre panier est toujours disponible'
  let message = 'Aucun paiement n’a été effectué. Vous pouvez modifier votre inscription puis reprendre le test quand vous le souhaitez.'
  let symbol = '←'

  if (isSuccess && verification.state === 'loading') {
    eyebrow = 'Vérification sécurisée'
    title = 'Nous vérifions votre paiement'
    message = 'La session Stripe et la commande sont contrôlées côté serveur.'
    symbol = '…'
  } else if (isSuccess && verification.state === 'confirmed') {
    eyebrow = 'Confirmation serveur'
    title = 'Votre paiement est confirmé'
    message = 'Le webhook Stripe a confirmé la commande. Votre inscription peut maintenant être prise en charge.'
    symbol = '✓'
  } else if (isSuccess && verification.state === 'pending') {
    eyebrow = 'Confirmation en attente'
    title = 'Stripe finalise la confirmation'
    message = 'La session existe, mais le webhook sécurisé n’a pas encore confirmé la commande. Actualisez cette page dans quelques instants.'
    symbol = '⌛'
  } else if (isSuccess && verification.state === 'error') {
    eyebrow = 'Vérification impossible'
    title = 'Le paiement ne peut pas encore être confirmé'
    message = verification.message
    symbol = '!'
  }

  return (
    <main className={`payment-status payment-status--${status}`}>
      <div className="payment-status-symbol" aria-hidden="true">
        {symbol}
      </div>
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{message}</p>

      {isSuccess && sessionId && (
        <small>Session de test : {sessionId}</small>
      )}

      <div className="payment-status-actions">
        <Link to={isSuccess ? '/' : '/panier'}>Retour à l’accueil</Link>
        <Link to="/panier">Voir le panier</Link>
        {verification.portalAvailable && (
          <button
            type="button"
            onClick={openCustomerPortal}
            disabled={portalLoading}
          >
            {portalLoading ? 'Ouverture…' : 'Gérer mon abonnement'}
          </button>
        )}
      </div>

      {verification.portalMessage && (
        <p className="payment-status-notice" role="alert">
          {verification.portalMessage}
        </p>
      )}
    </main>
  )
}

export default PaymentStatusPage
