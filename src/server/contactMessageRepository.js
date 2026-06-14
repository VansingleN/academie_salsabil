import { getStore } from '@netlify/blobs'

const STORE_NAME = 'academie-salsabil-contact-messages'

function clone(value) {
  return value == null ? null : structuredClone(value)
}

export function createMemoryContactMessageRepository() {
  const messages = new Map()

  return {
    async save(message) {
      messages.set(message.id, clone(message))
      return clone(message)
    },
    async get(messageId) {
      return clone(messages.get(messageId))
    },
    async list() {
      return [...messages.values()].map(clone)
    },
    async update(message) {
      if (!messages.has(message.id)) return null
      messages.set(message.id, clone(message))
      return clone(message)
    },
    async delete(messageId) {
      return messages.delete(messageId)
    }
  }
}

export function createNetlifyBlobsContactMessageRepository({ store } = {}) {
  let activeStore = store
  const getActiveStore = () => {
    activeStore ??= getStore(STORE_NAME)
    return activeStore
  }
  const keyFor = (messageId) => `messages/${messageId}.json`

  return {
    async save(message) {
      await getActiveStore().setJSON(keyFor(message.id), message, {
        onlyIfNew: true
      })
      return message
    },
    async get(messageId) {
      return getActiveStore().get(keyFor(messageId), {
        type: 'json',
        consistency: 'strong'
      })
    },
    async list() {
      const result = await getActiveStore().list({ prefix: 'messages/' })
      const messages = await Promise.all(
        result.blobs.map(({ key }) =>
          getActiveStore().get(key, {
            type: 'json',
            consistency: 'strong'
          })
        )
      )
      return messages.filter(Boolean)
    },
    async update(message) {
      const key = keyFor(message.id)
      const current = await getActiveStore().getWithMetadata(key, {
        type: 'json',
        consistency: 'strong'
      })
      if (!current?.data) return null

      const result = await getActiveStore().setJSON(key, message, {
        onlyIfMatch: current.etag
      })
      return result.modified ? message : null
    },
    async delete(messageId) {
      const key = keyFor(messageId)
      const current = await getActiveStore().get(key, {
        type: 'json',
        consistency: 'strong'
      })
      if (!current) return false
      await getActiveStore().delete(key)
      return true
    }
  }
}
