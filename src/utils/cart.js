const CART_STORAGE_KEY = 'academie-salsabil-cart'
const CART_UPDATED_EVENT = 'academie-salsabil-cart-updated'
const CART_ITEM_ADDED_EVENT = 'academie-salsabil-cart-item-added'

// Le stockage local ne contient que des références et des choix utilisateur.
// Les prix et libellés sont toujours reconstruits depuis offerCatalog.
export function getCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) ?? []
    // Migration douce des articles créés avant l'introduction du catalogue centralisé.
    const normalizedCart = storedCart.map((item, index) => {
      const legacyOfferId = item.offerId ?? item.productId
      const normalizedOfferId = legacyOfferId
        ?.replace(/^high-school-/, 'highSchool-')
        .replace(/^summer-camp-/, 'summerCamp-')
      // Les premières cartes Summer Camp ne distinguaient pas encore
      // l'accompagnement personnalisé des ateliers groupés.
      const offerId = normalizedOfferId?.replace(
        /^summerCamp-primary-(doux|equilibre)-(une-semaine|deux-semaines|un-mois)$/,
        'summerCamp-primary-personnalises-$1-$2'
      )

      return {
        cartItemId: item.cartItemId ?? `legacy-cart-item-${index}`,
        offerId,
        selections: item.selections ?? item.options ?? {}
      }
    })

    if (JSON.stringify(storedCart) !== JSON.stringify(normalizedCart)) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedCart))
    }

    return normalizedCart
  } catch {
    return []
  }
}

export function addCartItem(item) {
  const cart = getCart()
  const cartItem = {
    cartItemId: `${item.offerId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    offerId: item.offerId,
    selections: item.selections ?? {}
  }

  saveCart([...cart, cartItem])
  window.dispatchEvent(new CustomEvent(CART_ITEM_ADDED_EVENT, {
    detail: { cartItem, cartCount: cart.length + 1 }
  }))

  return cartItem
}

// Une modification peut concerner les options ou l'offre elle-même (classe/formule).
export function updateCartItem(cartItemId, updates) {
  const updatedCart = getCart().map((item) =>
    item.cartItemId === cartItemId
      ? {
          ...item,
          offerId: updates.offerId ?? item.offerId,
          selections: updates.selections ?? item.selections
        }
      : item
  )

  saveCart(updatedCart)
}

export function removeCartItem(cartItemId) {
  saveCart(getCart().filter((item) => item.cartItemId !== cartItemId))
}

export function clearCart() {
  saveCart([])
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  // L'événement met à jour immédiatement la page panier et le compteur de la navbar.
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: cart }))
}

export { CART_ITEM_ADDED_EVENT, CART_STORAGE_KEY, CART_UPDATED_EVENT }
