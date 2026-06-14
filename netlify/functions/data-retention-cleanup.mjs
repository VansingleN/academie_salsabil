import {
  DATA_RETENTION_POLICY,
  purgeExpiredContactMessages,
  purgeExpiredSupportRequests
} from '../../src/server/dataRetention.js'
import {
  createNetlifyBlobsContactMessageRepository
} from '../../src/server/contactMessageRepository.js'
import {
  createNetlifyBlobsSupportRequestRepository
} from '../../src/server/supportRequestRepository.js'

export default async function dataRetentionCleanup() {
  const runAt = new Date()

  try {
    const [supportRequests, contactMessages] = await Promise.all([
      purgeExpiredSupportRequests(
        createNetlifyBlobsSupportRequestRepository(),
        { now: runAt }
      ),
      purgeExpiredContactMessages(
        createNetlifyBlobsContactMessageRepository(),
        { now: runAt }
      )
    ])

    const report = {
      policyVersion: DATA_RETENTION_POLICY.version,
      runAt: runAt.toISOString(),
      supportRequests,
      contactMessages,
      enrollmentRecords: {
        deleted: 0,
        automaticDeletionEnabled:
          DATA_RETENTION_POLICY.enrollmentRecords.automaticDeletionEnabled
      }
    }

    console.info('Cycle de conservation terminé', report)
    return new Response(JSON.stringify(report), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
  } catch (error) {
    console.error('Échec du cycle de conservation', error)
    throw error
  }
}

export const config = {
  schedule: '@daily'
}
