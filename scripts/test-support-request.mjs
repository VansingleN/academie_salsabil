import assert from 'node:assert/strict'
import {
  createSupportRequest,
  listSupportRequests,
  SupportRequestError,
  updateSupportRequestStatus
} from '../src/server/supportRequest.js'
import {
  createMemorySupportRequestRepository
} from '../src/server/supportRequestRepository.js'

const repository = createMemorySupportRequestRepository()
const payload = {
  mode: 'slot',
  parentName: 'Parent Test',
  email: 'parent@example.com',
  phone: '+33 6 00 00 00 00',
  preferredContact: 'telephone',
  studentAge: '12',
  level: '5e',
  subjects: ['Mathématiques'],
  needType: 'regulier',
  format: 'individual',
  weeklyVolume: '2',
  startDate: '2026-09-01',
  objective: 'Consolider les bases en calcul littéral.',
  availability: 'Mardi et jeudi après 17 h.',
  consent: true,
  website: ''
}

const result = await createSupportRequest(payload, {
  repository,
  now: new Date('2026-06-13T10:00:00.000Z'),
  randomId: '12345678-1234-1234-1234-123456789abc'
})

assert.equal(result.accepted, true)
assert.equal(result.reference, 'SOUTIEN-20260613-12345678')

const saved = await repository.get('support_12345678-1234-1234-1234-123456789abc')
assert.equal(saved.status, 'new')
assert.equal(saved.contact.email, 'parent@example.com')
assert.deepEqual(saved.request.subjects, ['Mathématiques'])
assert.equal(saved.notification.status, 'not-configured')

assert.equal((await repository.list()).length, 1)

const page = listSupportRequests(await repository.list(), {
  page: 1,
  pageSize: 10,
  search: 'mathematiques',
  status: 'new',
  sort: 'newest'
})
assert.equal(page.requests.length, 1)
assert.equal(page.pagination.totalItems, 1)
assert.equal(page.pagination.totalPages, 1)
assert.equal(page.pagination.from, 1)
assert.equal(page.pagination.to, 1)

const emptyPage = listSupportRequests(await repository.list(), {
  search: 'inconnu'
})
assert.equal(emptyPage.requests.length, 0)
assert.equal(emptyPage.pagination.totalItems, 0)

const paginatedFixtures = Array.from({ length: 12 }, (_, index) => ({
  ...saved,
  id: `fixture_${index}`,
  reference: `SOUTIEN-FIXTURE-${index}`,
  createdAt: new Date(Date.UTC(2026, 5, index + 1)).toISOString()
}))
const secondPage = listSupportRequests(paginatedFixtures, {
  page: 2,
  pageSize: 10,
  sort: 'newest'
})
assert.equal(secondPage.requests.length, 2)
assert.equal(secondPage.pagination.totalItems, 12)
assert.equal(secondPage.pagination.totalPages, 2)
assert.equal(secondPage.pagination.from, 11)
assert.equal(secondPage.pagination.to, 12)

const updated = await updateSupportRequestStatus(
  { requestId: saved.id, status: 'contacted' },
  {
    repository,
    now: new Date('2026-06-13T11:00:00.000Z')
  }
)
assert.equal(updated.status, 'contacted')
assert.equal(updated.updatedAt, '2026-06-13T11:00:00.000Z')

await assert.rejects(
  () =>
    createSupportRequest(
      { ...payload, mode: 'slot', subjects: [] },
      { repository }
    ),
  (error) =>
    error instanceof SupportRequestError && error.code === 'SUBJECT_REQUIRED'
)

assert.equal(await repository.delete(saved.id), true)
assert.equal((await repository.list()).length, 0)

await assert.rejects(
  () =>
    createSupportRequest(
      { ...payload, website: 'https://spam.example' },
      { repository }
    ),
  (error) =>
    error instanceof SupportRequestError && error.code === 'SPAM_DETECTED'
)

console.log('Support request tests passed.')
