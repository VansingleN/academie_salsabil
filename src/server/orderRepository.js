import { getStore } from '@netlify/blobs'

const STORE_NAME = 'academie-salsabil-orders'

function clone(value) {
  return value == null ? null : structuredClone(value)
}

// Le reste de l'application dépend uniquement de cette petite interface.
// Une future base de données pourra donc remplacer Netlify Blobs sans modifier
// les services Stripe qui lisent et mettent à jour les commandes.
export function createMemoryOrderRepository() {
  const orders = new Map()
  const checkoutSessions = new Map()
  const subscriptions = new Map()
  const processedEvents = new Map()
  const emailDeliveries = new Map()

  return {
    async saveOrder(order) {
      orders.set(order.id, clone(order))

      if (order.checkoutSessionId) {
        checkoutSessions.set(order.checkoutSessionId, order.id)
      }

      if (order.subscriptionId) {
        subscriptions.set(order.subscriptionId, order.id)
      }

      return clone(order)
    },

    async getOrder(orderId) {
      return clone(orders.get(orderId))
    },

    async findOrderByCheckoutSession(sessionId) {
      const orderId = checkoutSessions.get(sessionId)
      return orderId ? clone(orders.get(orderId)) : null
    },

    async findOrderBySubscription(subscriptionId) {
      const orderId = subscriptions.get(subscriptionId)
      return orderId ? clone(orders.get(orderId)) : null
    },

    async getProcessedEvent(eventId) {
      return clone(processedEvents.get(eventId))
    },

    async saveProcessedEvent(eventRecord) {
      processedEvents.set(eventRecord.id, clone(eventRecord))
      return clone(eventRecord)
    },

    async claimEmailDelivery(claim) {
      const current = emailDeliveries.get(claim.id)
      const claimExpired = current?.status === 'processing'
        && new Date(current.claimExpiresAt).getTime() <= Date.now()
      const canRetry = current?.status === 'failed' || claimExpired

      if (current && !canRetry) return false

      emailDeliveries.set(claim.id, clone(claim))
      return true
    },

    async getEmailDelivery(deliveryId) {
      return clone(emailDeliveries.get(deliveryId))
    },

    async saveEmailDelivery(delivery) {
      emailDeliveries.set(delivery.id, clone(delivery))
      return clone(delivery)
    }
  }
}

function createBlobKey(group, id) {
  return `${group}/${id}.json`
}

// Netlify Blobs fournit un stockage persistant sans serveur de base de données.
// Les index séparés évitent de parcourir toutes les commandes lors d'un webhook.
export function createNetlifyBlobsOrderRepository({
  store
} = {}) {
  // L'initialisation reste paresseuse : une requête invalide peut être rejetée
  // avant d'exiger le contexte Netlify Blobs ou d'ouvrir le stockage.
  let activeStore = store
  const getActiveStore = () => {
    activeStore ??= getStore(STORE_NAME)
    return activeStore
  }

  // Les commandes et reçus webhook viennent souvent d'être écrits par une
  // autre Function. Une lecture forte évite le délai du cache distribué de
  // Netlify Blobs, qui pourrait sinon faire croire que la commande n'existe pas
  // encore ou permettre à deux livraisons proches de retraiter le même reçu.
  const getJson = (key) => getActiveStore().get(key, {
    type: 'json',
    consistency: 'strong'
  })

  return {
    async saveOrder(order) {
      const blobStore = getActiveStore()
      await blobStore.setJSON(createBlobKey('orders', order.id), order)

      if (order.checkoutSessionId) {
        await blobStore.setJSON(
          createBlobKey('checkout-sessions', order.checkoutSessionId),
          { orderId: order.id }
        )
      }

      if (order.subscriptionId) {
        await blobStore.setJSON(
          createBlobKey('subscriptions', order.subscriptionId),
          { orderId: order.id }
        )
      }

      return order
    },

    async getOrder(orderId) {
      return getJson(createBlobKey('orders', orderId))
    },

    async findOrderByCheckoutSession(sessionId) {
      const index = await getJson(createBlobKey('checkout-sessions', sessionId))
      return index?.orderId ? this.getOrder(index.orderId) : null
    },

    async findOrderBySubscription(subscriptionId) {
      const index = await getJson(createBlobKey('subscriptions', subscriptionId))
      return index?.orderId ? this.getOrder(index.orderId) : null
    },

    async getProcessedEvent(eventId) {
      return getJson(createBlobKey('stripe-events', eventId))
    },

    async saveProcessedEvent(eventRecord) {
      await getActiveStore().setJSON(
        createBlobKey('stripe-events', eventRecord.id),
        eventRecord
      )
      return eventRecord
    },

    async claimEmailDelivery(claim) {
      const blobStore = getActiveStore()
      const key = createBlobKey('email-deliveries', claim.id)
      const current = await blobStore.getWithMetadata(key, {
        type: 'json',
        consistency: 'strong'
      })
      const currentDelivery = current?.data
      const claimExpired = currentDelivery?.status === 'processing'
        && new Date(currentDelivery.claimExpiresAt).getTime() <= Date.now()
      const canRetry = currentDelivery?.status === 'failed' || claimExpired

      if (currentDelivery && !canRetry) return false

      const result = await blobStore.setJSON(
        key,
        claim,
        current?.etag
          ? { onlyIfMatch: current.etag }
          : { onlyIfNew: true }
      )

      return result.modified
    },

    async getEmailDelivery(deliveryId) {
      return getJson(createBlobKey('email-deliveries', deliveryId))
    },

    async saveEmailDelivery(delivery) {
      await getActiveStore().setJSON(
        createBlobKey('email-deliveries', delivery.id),
        delivery
      )
      return delivery
    }
  }
}
