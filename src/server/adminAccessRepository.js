import { getStore } from '@netlify/blobs'

const STORE_NAME = 'academie-salsabil-admin-security'

export function createMemoryAdminAccessRepository() {
  const attempts = []

  return {
    async countFailedAttempts(clientHash, windowId) {
      return attempts.filter(
        (attempt) =>
          attempt.clientHash === clientHash && attempt.windowId === windowId
      ).length
    },
    async saveFailedAttempt(attempt) {
      attempts.push(structuredClone(attempt))
      return attempt
    }
  }
}

export function createNetlifyBlobsAdminAccessRepository({ store } = {}) {
  let activeStore = store
  const getActiveStore = () => {
    activeStore ??= getStore(STORE_NAME)
    return activeStore
  }
  const prefixFor = (clientHash, windowId) =>
    `failed-attempts/${clientHash}/${encodeURIComponent(windowId)}/`

  return {
    async countFailedAttempts(clientHash, windowId) {
      const result = await getActiveStore().list({
        prefix: prefixFor(clientHash, windowId)
      })
      return result.blobs.length
    },
    async saveFailedAttempt(attempt) {
      const key =
        `${prefixFor(attempt.clientHash, attempt.windowId)}${attempt.attemptId}.json`
      await getActiveStore().setJSON(key, {
        createdAt: attempt.createdAt
      }, {
        onlyIfNew: true
      })
      return attempt
    }
  }
}
