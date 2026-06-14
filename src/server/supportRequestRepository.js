import { getStore } from '@netlify/blobs'

const STORE_NAME = 'academie-salsabil-support-requests'

function clone(value) {
  return value == null ? null : structuredClone(value)
}

export function createMemorySupportRequestRepository() {
  const requests = new Map()

  return {
    async save(request) {
      requests.set(request.id, clone(request))
      return clone(request)
    },

    async get(requestId) {
      return clone(requests.get(requestId))
    },

    async list() {
      return [...requests.values()]
        .map(clone)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    },

    async update(request) {
      if (!requests.has(request.id)) return null
      requests.set(request.id, clone(request))
      return clone(request)
    },

    async delete(requestId) {
      return requests.delete(requestId)
    }
  }
}

export function createNetlifyBlobsSupportRequestRepository({ store } = {}) {
  let activeStore = store
  const getActiveStore = () => {
    activeStore ??= getStore(STORE_NAME)
    return activeStore
  }

  return {
    async save(request) {
      await getActiveStore().setJSON(`requests/${request.id}.json`, request, {
        onlyIfNew: true
      })
      return request
    },

    async get(requestId) {
      return getActiveStore().get(`requests/${requestId}.json`, {
        type: 'json',
        consistency: 'strong'
      })
    },

    async list() {
      const result = await getActiveStore().list({ prefix: 'requests/' })
      const requests = await Promise.all(
        result.blobs.map(({ key }) =>
          getActiveStore().get(key, {
            type: 'json',
            consistency: 'strong'
          })
        )
      )

      return requests
        .filter(Boolean)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    },

    async update(request) {
      const key = `requests/${request.id}.json`
      const current = await getActiveStore().getWithMetadata(key, {
        type: 'json',
        consistency: 'strong'
      })

      if (!current?.data) return null

      const result = await getActiveStore().setJSON(key, request, {
        onlyIfMatch: current.etag
      })

      return result.modified ? request : null
    },

    async delete(requestId) {
      const key = `requests/${requestId}.json`
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
