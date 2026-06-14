import { getStore } from '@netlify/blobs'

const STORE_NAME = 'academie-salsabil-form-security'

export function createMemoryFormSubmissionProtectionRepository() {
  const attempts = []

  return {
    async countAttempts(clientHash, windowId) {
      return attempts.filter(
        (attempt) =>
          attempt.clientHash === clientHash && attempt.windowId === windowId
      ).length
    },
    async saveAttempt(attempt) {
      attempts.push(structuredClone(attempt))
      return attempt
    }
  }
}

export function createNetlifyBlobsFormSubmissionProtectionRepository({
  store
} = {}) {
  let activeStore = store
  const getActiveStore = () => {
    activeStore ??= getStore(STORE_NAME)
    return activeStore
  }

  const prefixFor = (clientHash, windowId) =>
    `attempts/${clientHash}/${encodeURIComponent(windowId)}/`

  return {
    async countAttempts(clientHash, windowId) {
      const result = await getActiveStore().list({
        prefix: prefixFor(clientHash, windowId)
      })
      return result.blobs.length
    },
    async saveAttempt(attempt) {
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
