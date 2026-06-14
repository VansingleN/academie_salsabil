import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CART_ITEM_ADDED_EVENT } from '../utils/cart'
import { resolveCartItem } from '../data/offerCatalog'
import './CartAddedToast.css'

function CartAddedToast() {
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let closeTimer

    const handleItemAdded = (event) => {
      const resolvedItem = resolveCartItem(event.detail.cartItem)

      window.clearTimeout(closeTimer)
      setNotification({
        cartCount: event.detail.cartCount,
        label: resolvedItem
          ? `${resolvedItem.curriculum} · ${resolvedItem.gradeLongLabel}`
          : 'Votre offre'
      })
      closeTimer = window.setTimeout(() => setNotification(null), 6500)
    }

    window.addEventListener(CART_ITEM_ADDED_EVENT, handleItemAdded)

    return () => {
      window.clearTimeout(closeTimer)
      window.removeEventListener(CART_ITEM_ADDED_EVENT, handleItemAdded)
    }
  }, [])

  if (!notification) return null

  return (
    <aside className="cart-added-toast" role="status" aria-live="polite">
      <button
        className="cart-added-toast__close"
        type="button"
        aria-label="Fermer la confirmation"
        onClick={() => setNotification(null)}
      >
        ×
      </button>
      <span>Ajout confirmé</span>
      <h2>Offre ajoutée au panier</h2>
      <p>
        {notification.label} a bien été ajoutée. Un nouvel ajout créera une autre
        inscription, par exemple pour un second enfant.
      </p>
      <div>
        <button
          type="button"
          onClick={() => {
            setNotification(null)
            navigate('/panier')
          }}
        >
          Voir mon panier ({notification.cartCount})
        </button>
        <button type="button" onClick={() => setNotification(null)}>
          Continuer mes choix
        </button>
      </div>
    </aside>
  )
}

export default CartAddedToast
