import assert from 'node:assert/strict'
import {
  BrevoEmailError,
  createBrevoEmailProvider
} from '../src/server/brevoEmailProvider.js'
import {
  createConfiguredTransactionalEmailService
} from '../src/server/transactionalEmailConfiguration.js'

const baseConfiguration = {
  apiKey: 'xkeysib-test-only',
  senderEmail: 'notifications@academie-salsabil.test',
  senderName: 'Académie Salsabil',
  replyToEmail: 'contact@academie-salsabil.test',
  replyToName: 'Académie Salsabil',
  deliveryMode: 'test',
  allowedRecipients: [
    'parent@example.test',
    'equipe@example.test'
  ]
}

const message = {
  to: 'parent@example.test',
  subject: 'Paiement confirmé',
  html: '<p>Confirmation</p>',
  text: 'Confirmation',
  idempotencyKey: 'evt_test:initial_payment_confirmed:family',
  tags: {
    templateId: 'initial_payment_confirmed',
    audience: 'family'
  }
}

let capturedRequest = null
const successProvider = createBrevoEmailProvider({
  ...baseConfiguration,
  async fetchImpl(url, options) {
    capturedRequest = { url, options }
    return new Response(
      JSON.stringify({ messageId: '<brevo-test@example.test>' }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
const success = await successProvider.send(message)
const sentPayload = JSON.parse(capturedRequest.options.body)

assert.equal(success.id, '<brevo-test@example.test>')
assert.equal(capturedRequest.url, 'https://api.brevo.com/v3/smtp/email')
assert.equal(capturedRequest.options.headers['api-key'], 'xkeysib-test-only')
assert.equal(sentPayload.sender.email, baseConfiguration.senderEmail)
assert.equal(sentPayload.replyTo.email, baseConfiguration.replyToEmail)
assert.equal(sentPayload.to[0].email, message.to)
assert.equal(
  sentPayload.headers['Idempotency-Key'],
  message.idempotencyKey
)
assert.deepEqual(sentPayload.tags, [
  'initial_payment_confirmed',
  'family'
])

// En mode test, une adresse absente de la liste ne doit jamais atteindre Brevo.
let blockedFetchCalled = false
const restrictedProvider = createBrevoEmailProvider({
  ...baseConfiguration,
  async fetchImpl() {
    blockedFetchCalled = true
    throw new Error('Cette fonction ne doit pas être appelée.')
  }
})
await assert.rejects(
  restrictedProvider.send({
    ...message,
    to: 'inconnu@example.test'
  }),
  (error) =>
    error instanceof BrevoEmailError
    && error.code === 'BREVO_RECIPIENT_NOT_ALLOWED'
    && error.retryable === false
)
assert.equal(blockedFetchCalled, false)

async function expectHttpError(status, code, retryable) {
  const provider = createBrevoEmailProvider({
    ...baseConfiguration,
    async fetchImpl() {
      return new Response(JSON.stringify({ message: 'Erreur simulée' }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  })

  await assert.rejects(
    provider.send(message),
    (error) =>
      error.code === code
      && error.retryable === retryable
      && error.status === status
  )
}

await expectHttpError(429, 'BREVO_TEMPORARY_ERROR', true)
await expectHttpError(503, 'BREVO_TEMPORARY_ERROR', true)
await expectHttpError(400, 'BREVO_PERMANENT_ERROR', false)

const invalidResponseProvider = createBrevoEmailProvider({
  ...baseConfiguration,
  async fetchImpl() {
    return new Response(JSON.stringify({ unexpected: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
await assert.rejects(
  invalidResponseProvider.send(message),
  (error) =>
    error.code === 'BREVO_INVALID_RESPONSE'
    && error.retryable === true
)

const networkProvider = createBrevoEmailProvider({
  ...baseConfiguration,
  async fetchImpl() {
    throw new TypeError('Connexion simulée indisponible')
  }
})
await assert.rejects(
  networkProvider.send(message),
  (error) =>
    error.code === 'BREVO_NETWORK_ERROR'
    && error.retryable === true
)

const timeoutProvider = createBrevoEmailProvider({
  ...baseConfiguration,
  timeoutMilliseconds: 100,
  fetchImpl(url, { signal }) {
    void url
    return new Promise((resolve, reject) => {
      void resolve
      signal.addEventListener('abort', () => {
        const error = new Error('Aborted')
        error.name = 'AbortError'
        reject(error)
      })
    })
  }
})
await assert.rejects(
  timeoutProvider.send(message),
  (error) =>
    error.code === 'BREVO_TIMEOUT'
    && error.retryable === true
)

// Le mode désactivé ne demande volontairement aucun secret ni domaine.
assert.doesNotThrow(() =>
  createConfiguredTransactionalEmailService({
    environment: { TRANSACTIONAL_EMAIL_MODE: 'disabled' }
  })
)

// Toute activation partielle doit échouer avant le premier webhook traité.
assert.throws(
  () => createConfiguredTransactionalEmailService({
    environment: {
      TRANSACTIONAL_EMAIL_MODE: 'provider',
      TRANSACTIONAL_EMAIL_PROVIDER: 'brevo',
      TRANSACTIONAL_EMAIL_DELIVERY_MODE: 'test',
      TRANSACTIONAL_EMAIL_INTERNAL_RECIPIENT: 'equipe@example.test',
      TRANSACTIONAL_EMAIL_SENDER_EMAIL:
        'notifications@academie-salsabil.test',
      TRANSACTIONAL_EMAIL_SENDER_NAME: 'Académie Salsabil',
      TRANSACTIONAL_EMAIL_REPLY_TO_EMAIL:
        'contact@academie-salsabil.test',
      TRANSACTIONAL_EMAIL_REPLY_TO_NAME: 'Académie Salsabil',
      TRANSACTIONAL_EMAIL_TEST_RECIPIENTS: 'equipe@example.test'
    }
  }),
  (error) => error.code === 'BREVO_NOT_CONFIGURED'
)

assert.throws(
  () => createBrevoEmailProvider({
    ...baseConfiguration,
    allowedRecipients: []
  }),
  (error) => error.code === 'BREVO_TEST_ALLOWLIST_REQUIRED'
)

assert.throws(
  () => createBrevoEmailProvider({
    ...baseConfiguration,
    timeoutMilliseconds: Number.NaN
  }),
  (error) => error.code === 'BREVO_INVALID_TIMEOUT'
)

assert.throws(
  () => createBrevoEmailProvider({
    ...baseConfiguration,
    allowedRecipients: ['adresse-invalide']
  }),
  (error) => error.code === 'BREVO_INVALID_TEST_ALLOWLIST'
)

console.log('Adaptateur Brevo : tests réussis')
