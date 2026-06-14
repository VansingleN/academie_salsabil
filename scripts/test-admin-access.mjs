import assert from 'node:assert/strict'
import {
  AdminAccessError,
  authorizeAdminRequest
} from '../src/server/adminAccess.js'
import {
  createMemoryAdminAccessRepository
} from '../src/server/adminAccessRepository.js'

function createRequest(key, address = '203.0.113.10') {
  return new Request('https://example.test/api/admin-orders', {
    headers: {
      Authorization: `Bearer ${key}`,
      'X-Forwarded-For': address
    }
  })
}

const repository = createMemoryAdminAccessRepository()
const options = {
  configuredKey: 'une-cle-administrateur-longue',
  repository,
  now: new Date('2026-06-14T10:00:00.000Z'),
  maximumFailedAttempts: 2
}

const authenticated = await authorizeAdminRequest(
  createRequest('une-cle-administrateur-longue'),
  options
)
assert.equal(authenticated.authenticated, true)

await assert.rejects(
  authorizeAdminRequest(createRequest('mauvaise-cle'), {
    ...options,
    randomId: 'attempt-1'
  }),
  (error) =>
    error instanceof AdminAccessError
    && error.code === 'UNAUTHORIZED'
    && error.status === 401
)

await assert.rejects(
  authorizeAdminRequest(createRequest('encore-faux'), {
    ...options,
    randomId: 'attempt-2'
  }),
  (error) =>
    error instanceof AdminAccessError
    && error.code === 'ADMIN_RATE_LIMITED'
    && error.status === 429
    && error.retryAfterSeconds > 0
)

const otherAddress = await authorizeAdminRequest(
  createRequest('une-cle-administrateur-longue', '203.0.113.11'),
  options
)
assert.equal(otherAddress.authenticated, true)

console.log('Protection de l’accès administrateur : OK')
