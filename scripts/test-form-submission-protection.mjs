import assert from 'node:assert/strict'
import {
  checkFormSubmissionProtection,
  FormSubmissionProtectionError
} from '../src/server/formSubmissionProtection.js'
import {
  createMemoryFormSubmissionProtectionRepository
} from '../src/server/formSubmissionProtectionRepository.js'

const repository = createMemoryFormSubmissionProtectionRepository()
const now = new Date('2026-06-14T12:00:00.000Z')

await assert.rejects(
  () =>
    checkFormSubmissionProtection(
      {
        formStartedAt: '2026-06-14T11:59:59.500Z',
        clientAddress: '203.0.113.10'
      },
      { repository, now }
    ),
  (error) =>
    error instanceof FormSubmissionProtectionError
    && error.code === 'FORM_SUBMITTED_TOO_QUICKLY'
)

for (let index = 0; index < 8; index += 1) {
  const result = await checkFormSubmissionProtection(
    {
      formStartedAt: '2026-06-14T11:59:55.000Z',
      clientAddress: '203.0.113.10'
    },
    {
      repository,
      now,
      randomId: `attempt-${index}`
    }
  )
  assert.equal(result.allowed, true)
}

await assert.rejects(
  () =>
    checkFormSubmissionProtection(
      {
        formStartedAt: '2026-06-14T11:59:55.000Z',
        clientAddress: '203.0.113.10'
      },
      { repository, now }
    ),
  (error) =>
    error instanceof FormSubmissionProtectionError
    && error.code === 'FORM_RATE_LIMITED'
)

const withoutAddress = await checkFormSubmissionProtection(
  {
    formStartedAt: '2026-06-14T11:59:55.000Z',
    clientAddress: ''
  },
  { repository, now }
)
assert.equal(withoutAddress.rateLimitApplied, false)

console.log('Form submission protection tests passed.')
