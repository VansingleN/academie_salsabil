import { createCartQuote, CartQuoteError } from './src/server/cartQuote.js'
import {
  createStripeCheckoutSession,
  StripeCheckoutError
} from './src/server/stripeCheckout.js'
import { StripeApiError } from './src/server/stripeApi.js'
import {
  EnrollmentProfileError
} from './src/server/enrollmentProfile.js'
import {
  createMemoryOrderRepository
} from './src/server/orderRepository.js'
import {
  createCustomerPortalSession,
  verifyCheckoutSession
} from './src/server/stripeSession.js'
import {
  processStripeEvent,
  StripeWebhookError,
  verifyStripeWebhook
} from './src/server/stripeWebhook.js'
import {
  createConfiguredTransactionalEmailService
} from './src/server/transactionalEmailConfiguration.js'

// Le serveur Vite conserve les commandes tant qu'il reste lancé. En production,
// les mêmes services utilisent Netlify Blobs à la place de cette mémoire locale.
const localOrderRepository = createMemoryOrderRepository()

function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

async function readRawBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString('utf8')
}

async function readJsonBody(request) {
  return JSON.parse(await readRawBody(request))
}

// Ce middleware reproduit localement la route Netlify avec le même moteur métier.
// Il n’est inclus que par le serveur de développement Vite.
export function cartQuotePlugin() {
  return {
    name: 'academie-salsabil-cart-quote',
    configureServer(server) {
      const handleCartQuote = async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, {
            valid: false,
            code: 'METHOD_NOT_ALLOWED',
            message: 'Méthode non autorisée.'
          })
          return
        }

        try {
          const payload = await readJsonBody(request)
          sendJson(response, 200, createCartQuote(payload))
        } catch (error) {
          const status = error instanceof CartQuoteError ? error.status : 400
          sendJson(response, status, {
            valid: false,
            code: error.code ?? 'INVALID_REQUEST',
            message: error.message ?? 'La requête est invalide.'
          })
        }
      }

      // Vite ne préfixe pas les middlewares personnalisés avec config.base.
      server.middlewares.use('/api/cart-quote', handleCartQuote)
      server.middlewares.use(`${server.config.base}api/cart-quote`, handleCartQuote)

      const handleCheckout = async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, {
            checkoutReady: false,
            code: 'METHOD_NOT_ALLOWED',
            message: 'Méthode non autorisée.'
          })
          return
        }

        try {
          const payload = await readJsonBody(request)
          const checkout = await createStripeCheckoutSession({
            payload,
            secretKey: process.env.STRIPE_SECRET_KEY,
            siteUrl: server.resolvedUrls?.local[0] ?? 'http://127.0.0.1:5173',
            orderRepository: localOrderRepository
          })
          sendJson(response, 200, checkout)
        } catch (error) {
          const knownError =
            error instanceof CartQuoteError
            || error instanceof StripeCheckoutError
            || error instanceof StripeApiError
            || error instanceof EnrollmentProfileError
          sendJson(response, knownError ? error.status : 500, {
            checkoutReady: false,
            code: knownError ? error.code : 'SERVER_ERROR',
            message: knownError
              ? error.message
              : 'La page de paiement ne peut pas être préparée.'
          })
        }
      }

      server.middlewares.use('/api/create-checkout-session', handleCheckout)
      server.middlewares.use(
        `${server.config.base}api/create-checkout-session`,
        handleCheckout
      )

      const handleSessionVerification = async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, {
            verified: false,
            code: 'METHOD_NOT_ALLOWED',
            message: 'Méthode non autorisée.'
          })
          return
        }

        try {
          const { sessionId } = await readJsonBody(request)
          const result = await verifyCheckoutSession({
            sessionId,
            secretKey: process.env.STRIPE_SECRET_KEY,
            orderRepository: localOrderRepository,
            portalEnabled: process.env.STRIPE_PORTAL_ENABLED === 'true'
          })
          sendJson(response, 200, result)
        } catch (error) {
          const knownError = error instanceof StripeApiError
          sendJson(response, knownError ? error.status : 500, {
            verified: false,
            code: knownError ? error.code : 'SERVER_ERROR',
            message: knownError
              ? error.message
              : 'La session de paiement ne peut pas être vérifiée.'
          })
        }
      }

      server.middlewares.use('/api/verify-checkout-session', handleSessionVerification)
      server.middlewares.use(
        `${server.config.base}api/verify-checkout-session`,
        handleSessionVerification
      )

      const handleCustomerPortal = async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, {
            portalReady: false,
            code: 'METHOD_NOT_ALLOWED',
            message: 'Méthode non autorisée.'
          })
          return
        }

        try {
          const { sessionId } = await readJsonBody(request)
          const portal = await createCustomerPortalSession({
            sessionId,
            secretKey: process.env.STRIPE_SECRET_KEY,
            orderRepository: localOrderRepository,
            siteUrl: server.resolvedUrls?.local[0] ?? 'http://127.0.0.1:5173',
            portalEnabled: process.env.STRIPE_PORTAL_ENABLED === 'true'
          })
          sendJson(response, 200, portal)
        } catch (error) {
          const knownError = error instanceof StripeApiError
          sendJson(response, knownError ? error.status : 500, {
            portalReady: false,
            code: knownError ? error.code : 'SERVER_ERROR',
            message: knownError
              ? error.message
              : 'Le portail client ne peut pas être ouvert.'
          })
        }
      }

      server.middlewares.use('/api/create-customer-portal', handleCustomerPortal)
      server.middlewares.use(
        `${server.config.base}api/create-customer-portal`,
        handleCustomerPortal
      )

      const handleWebhook = async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, {
            received: false,
            code: 'METHOD_NOT_ALLOWED',
            message: 'Méthode non autorisée.'
          })
          return
        }

        try {
          const rawBody = await readRawBody(request)
          const event = verifyStripeWebhook({
            rawBody,
            signatureHeader: request.headers['stripe-signature'],
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
          })
          const result = await processStripeEvent({
            event,
            orderRepository: localOrderRepository,
            secretKey: process.env.STRIPE_SECRET_KEY,
            notificationService: createConfiguredTransactionalEmailService()
          })
          sendJson(response, 200, result)
        } catch (error) {
          const knownError = error instanceof StripeWebhookError
          sendJson(response, knownError ? error.status : 500, {
            received: false,
            code: knownError ? error.code : 'SERVER_ERROR',
            message: knownError
              ? error.message
              : 'L’événement Stripe ne peut pas être traité.'
          })
        }
      }

      server.middlewares.use('/api/stripe-webhook', handleWebhook)
      server.middlewares.use(
        `${server.config.base}api/stripe-webhook`,
        handleWebhook
      )

      // Avec un base path (GitHub Pages), Vite 8 retire le préfixe avant ses
      // middlewares internes. Ce second enregistrement intervient ensuite et
      // permet aux mêmes URL préfixées de fonctionner en développement local.
      return () => {
        server.middlewares.use('/api/cart-quote', handleCartQuote)
        server.middlewares.use('/api/create-checkout-session', handleCheckout)
        server.middlewares.use('/api/verify-checkout-session', handleSessionVerification)
        server.middlewares.use('/api/create-customer-portal', handleCustomerPortal)
        server.middlewares.use('/api/stripe-webhook', handleWebhook)
      }
    }
  }
}
