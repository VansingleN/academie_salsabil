import assert from 'node:assert/strict'
import {
  ContactMessageError,
  createContactMessage,
  listContactMessages,
  updateContactMessageStatus
} from '../src/server/contactMessage.js'
import {
  createMemoryContactMessageRepository
} from '../src/server/contactMessageRepository.js'

const repository = createMemoryContactMessageRepository()
const payload = {
  firstname: 'Amina',
  lastname: 'Test',
  email: 'amina@example.com',
  phone: '+33 6 00 00 00 00',
  message: 'Je souhaite obtenir des informations sur les accompagnements.',
  consent: true,
  website: ''
}

const result = await createContactMessage(payload, {
  repository,
  now: new Date('2026-06-14T10:00:00.000Z'),
  randomId: '12345678-1234-1234-1234-123456789abc'
})

assert.equal(result.accepted, true)
assert.equal(result.reference, 'CONTACT-20260614-12345678')

const saved = await repository.get('contact_12345678-1234-1234-1234-123456789abc')
assert.equal(saved.status, 'new')
assert.equal(saved.contact.email, 'amina@example.com')
assert.equal(saved.consent.contact, true)

const listed = listContactMessages(await repository.list(), {
  search: 'accompagnements',
  status: 'new'
})
assert.equal(listed.messages.length, 1)
assert.equal(listed.pagination.totalItems, 1)

const updated = await updateContactMessageStatus(
  { messageId: saved.id, status: 'contacted' },
  {
    repository,
    now: new Date('2026-06-14T11:00:00.000Z')
  }
)
assert.equal(updated.status, 'contacted')

await assert.rejects(
  () => createContactMessage({ ...payload, consent: false }, { repository }),
  (error) =>
    error instanceof ContactMessageError && error.code === 'CONSENT_REQUIRED'
)

await assert.rejects(
  () =>
    createContactMessage(
      { ...payload, website: 'https://spam.example' },
      { repository }
    ),
  (error) =>
    error instanceof ContactMessageError && error.code === 'SPAM_DETECTED'
)

assert.equal(await repository.delete(saved.id), true)
assert.equal((await repository.list()).length, 0)

console.log('Contact message tests passed.')
