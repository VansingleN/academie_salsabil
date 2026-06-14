import assert from 'node:assert/strict'
import {
  createConfiguredFormNotificationService
} from '../src/server/formNotification.js'
import { createContactMessage } from '../src/server/contactMessage.js'
import {
  createMemoryContactMessageRepository
} from '../src/server/contactMessageRepository.js'

const disabled = createConfiguredFormNotificationService({
  environment: { FORM_NOTIFICATION_MODE: 'disabled' }
})
assert.equal(
  (await disabled.notifyContactMessage({})).status,
  'not-configured'
)

let capturedPayload
const service = createConfiguredFormNotificationService({
  environment: {
    FORM_NOTIFICATION_MODE: 'provider',
    FORM_NOTIFICATION_INTERNAL_RECIPIENT: 'equipe@example.test',
    TRANSACTIONAL_EMAIL_PROVIDER: 'brevo',
    TRANSACTIONAL_EMAIL_DELIVERY_MODE: 'test',
    TRANSACTIONAL_EMAIL_TEST_RECIPIENTS: 'equipe@example.test',
    TRANSACTIONAL_EMAIL_SENDER_EMAIL: 'notifications@example.test',
    TRANSACTIONAL_EMAIL_SENDER_NAME: 'Académie Salsabil',
    TRANSACTIONAL_EMAIL_REPLY_TO_EMAIL: 'contact@example.test',
    TRANSACTIONAL_EMAIL_REPLY_TO_NAME: 'Académie Salsabil',
    TRANSACTIONAL_EMAIL_TIMEOUT_MS: '10000',
    BREVO_API_KEY: 'xkeysib-test'
  },
  async fetchImpl(url, options) {
    void url
    capturedPayload = JSON.parse(options.body)
    return new Response(JSON.stringify({ messageId: 'brevo-form-test' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

const repository = createMemoryContactMessageRepository()
await createContactMessage(
  {
    firstname: 'Amina',
    lastname: 'Test',
    email: 'amina@example.com',
    phone: '',
    message: 'Je souhaite être renseignée.',
    consent: true,
    website: ''
  },
  {
    repository,
    notificationService: service,
    now: new Date('2026-06-14T12:00:00.000Z'),
    randomId: '12345678-1234-1234-1234-123456789abc'
  }
)

const saved = await repository.get(
  'contact_12345678-1234-1234-1234-123456789abc'
)
assert.equal(saved.notification.status, 'sent')
assert.equal(saved.notification.providerMessageId, 'brevo-form-test')
assert.equal(capturedPayload.to[0].email, 'equipe@example.test')
assert.match(capturedPayload.subject, /CONTACT-20260614-12345678/)
assert.match(capturedPayload.textContent, /amina@example.com/)

const failedRepository = createMemoryContactMessageRepository()
await createContactMessage(
  {
    firstname: 'Nora',
    lastname: 'Test',
    email: 'nora@example.com',
    phone: '',
    message: 'Message enregistré malgré la panne.',
    consent: true,
    website: ''
  },
  {
    repository: failedRepository,
    notificationService: {
      async notifyContactMessage() {
        const error = new Error('Panne simulée')
        error.code = 'SIMULATED_FAILURE'
        throw error
      }
    },
    logger: { error() {} },
    now: new Date('2026-06-14T13:00:00.000Z'),
    randomId: '87654321-1234-1234-1234-123456789abc'
  }
)
assert.equal(
  (await failedRepository.get(
    'contact_87654321-1234-1234-1234-123456789abc'
  )).notification.status,
  'failed'
)

console.log('Notifications de formulaires validées.')
