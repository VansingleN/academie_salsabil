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
    }
  }
}

function createBlobKey(group, id) {
  return `${group}/${id}.json`
}

// Netlify Blobs fournit un stockage persistant sans serveur de base de données.
// Les index séparés évitent de parcourir toutes les commandes lors d'un webhook.
export function createNetlifyBlobsOrderRepository({
  store = getStore(STORE_NAME)
} = {}) {
  const getJson = (key) => store.get(key, { type: 'json' })

  return {
    async saveOrder(order) {
      await store.setJSON(createBlobKey('orders', order.id), order)

      if (order.checkoutSessionId) {
        await store.setJSON(
          createBlobKey('checkout-sessions', order.checkoutSessionId),
          { orderId: order.id }
        )
      }

      if (order.subscriptionId) {
        await store.setJSON(
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
      await store.setJSON(
        createBlobKey('stripe-events', eventRecord.id),
        eventRecord
      )
      return eventRecord
    }
  }
}
