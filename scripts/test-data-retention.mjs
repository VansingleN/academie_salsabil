import assert from 'node:assert/strict'
import {
  DATA_RETENTION_POLICY,
  getContactMessageExpiry,
  getSupportRequestExpiry,
  purgeExpiredContactMessages,
  purgeExpiredSupportRequests
} from '../src/server/dataRetention.js'
import {
  createMemoryContactMessageRepository
} from '../src/server/contactMessageRepository.js'
import {
  createMemorySupportRequestRepository
} from '../src/server/supportRequestRepository.js'

const supportRepository = createMemorySupportRequestRepository()
await supportRepository.save({
  id: 'support_open_expired',
  status: 'new',
  createdAt: '2025-06-01T10:00:00.000Z'
})
await supportRepository.save({
  id: 'support_closed_expired',
  status: 'closed',
  createdAt: '2025-11-01T10:00:00.000Z',
  updatedAt: '2025-12-01T10:00:00.000Z'
})
await supportRepository.save({
  id: 'support_active',
  status: 'contacted',
  createdAt: '2026-01-01T10:00:00.000Z'
})

const supportReport = await purgeExpiredSupportRequests(supportRepository, {
  now: new Date('2026-06-14T10:00:00.000Z')
})

assert.deepEqual(supportReport, {
  scanned: 3,
  warned: 2,
  warningsCleared: 0,
  eligibleForDeletion: 0,
  deleted: 0,
  failedIds: []
})
assert.equal(
  (await supportRepository.get('support_open_expired')).retention
    .scheduledDeletionAt,
  '2026-07-14T10:00:00.000Z'
)
assert.equal(
  (await supportRepository.get('support_closed_expired')).retention
    .scheduledDeletionAt,
  '2026-07-14T10:00:00.000Z'
)
assert.ok(await supportRepository.get('support_active'))

const supportDeletionReport = await purgeExpiredSupportRequests(
  supportRepository,
  { now: new Date('2026-07-14T10:00:00.000Z') }
)
assert.equal(supportDeletionReport.deleted, 2)
assert.equal(await supportRepository.get('support_open_expired'), null)
assert.equal(await supportRepository.get('support_closed_expired'), null)

const contactRepository = createMemoryContactMessageRepository()
await contactRepository.save({
  id: 'contact_warning_period',
  status: 'closed',
  createdAt: '2025-11-01T00:00:00.000Z',
  updatedAt: '2025-12-30T10:00:00.000Z'
})
await contactRepository.save({
  id: 'contact_recent',
  status: 'new',
  createdAt: '2026-05-01T00:00:00.000Z'
})

const contactReport = await purgeExpiredContactMessages(contactRepository, {
  now: new Date('2026-06-14T10:00:00.000Z')
})

assert.equal(contactReport.warned, 1)
assert.equal(contactReport.deleted, 0)
assert.equal(
  (await contactRepository.get('contact_warning_period')).retention.expiresAt,
  '2026-06-30T10:00:00.000Z'
)
assert.equal(
  (await contactRepository.get('contact_warning_period')).retention
    .scheduledDeletionAt,
  '2026-07-30T10:00:00.000Z'
)
assert.ok(await contactRepository.get('contact_recent'))

assert.equal(
  getSupportRequestExpiry({
    status: 'new',
    createdAt: '2025-01-31T12:00:00.000Z'
  }).toISOString(),
  '2026-01-31T12:00:00.000Z'
)
assert.equal(
  getContactMessageExpiry({
    status: 'closed',
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2025-08-31T12:00:00.000Z'
  }).toISOString(),
  '2026-02-28T12:00:00.000Z'
)
assert.equal(
  DATA_RETENTION_POLICY.enrollmentRecords.automaticDeletionEnabled,
  false
)

console.log('Politique de conservation validée.')
