const CART_STORAGE_KEY = 'academie-salsabil-cart'
const CART_UPDATED_EVENT = 'academie-salsabil-cart-updated'

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function addCartItem(item) {
  const cart = getCart()
  const cartItem = {
    ...item,
    cartItemId: `${item.productId}-${Date.now()}`
  }

  const updatedCart = [...cart, cartItem]
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart))
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: updatedCart }))

  return cartItem
}

export { CART_STORAGE_KEY, CART_UPDATED_EVENT }
