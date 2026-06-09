import {
  buildTransactionalEmailMessages
} from './transactionalEmailTemplates.js'

const EMAIL_MODES = new Set(['disabled', 'preview', 'provider'])
const CLAIM_TIMEOUT_MILLISECONDS = 15 * 60 * 1000

class TransactionalEmailError extends Error {
  constructor(message, code = 'TRANSACTIONAL_EMAIL_ERROR') {
    super(message)
    this.name = 'TransactionalEmailError'
    this.code = code
  }
}

function createDeliveryId(eventId, message) {
  return `${eventId}:${message.templateId}:${message.audience}`
}

function createSafeLogData(message, status) {
  return {
    templateId: message.templateId,
    audience: message.audience,
    orderNumber: message.orderNumber,
    status
  }
}

// Le fournisseur est injecté : Resend, Postmark ou un autre service pourra
// implémenter send(message) sans modifier les modèles ni le webhook.
export function createTransactionalEmailService({
  mode = 'disabled',
  provider = null,
  internalRecipient = '',
  logger = console,
  now = () => new Date().toISOString()
} = {}) {
  if (!EMAIL_MODES.has(mode)) {
    throw new TransactionalEmailError(
      'Le mode e-mail configuré est invalide.',
      'INVALID_EMAIL_MODE'
    )
  }

  if (mode !== 'disabled' && !provider?.send) {
    throw new TransactionalEmailError(
      'Aucun fournisseur e-mail n’est configuré.',
      'EMAIL_PROVIDER_NOT_CONFIGURED'
    )
  }

  if (mode === 'provider' && !internalRecipient) {
    throw new TransactionalEmailError(
      'Le destinataire interne des notifications n’est pas configuré.',
      'INTERNAL_EMAIL_RECIPIENT_NOT_CONFIGURED'
    )
  }

  return {
    async handleEvent({ event, order, orderRepository }) {
      const messages = buildTransactionalEmailMessages({
        event,
        order,
        internalRecipient
      })
      const results = []

      for (const message of messages) {
        const deliveryId = createDeliveryId(event.id, message)
        const claimedAt = now()
        const claimed = await orderRepository.claimEmailDelivery({
          id: deliveryId,
          eventId: event.id,
          orderId: order.id,
          templateId: message.templateId,
          audience: message.audience,
          status: 'processing',
          claimedAt,
          claimExpiresAt: new Date(
            new Date(claimedAt).getTime() + CLAIM_TIMEOUT_MILLISECONDS
          ).toISOString()
        })

        if (!claimed) {
          const currentDelivery = await orderRepository.getEmailDelivery(
            deliveryId
          )

          if (currentDelivery?.status === 'processing') {
            throw new TransactionalEmailError(
              'Un envoi e-mail est déjà en cours de traitement.',
              'EMAIL_DELIVERY_IN_PROGRESS'
            )
          }

          results.push({ deliveryId, status: 'duplicate' })
          continue
        }

        try {
          let status = 'skipped'
          let providerMessageId = null

          if (mode !== 'disabled' && message.to) {
            // L'adaptateur fournisseur doit transmettre cette clé à son API
            // pour couvrir aussi une coupure après l'envoi mais avant le reçu.
            const response = await provider.send({
              ...message,
              idempotencyKey: deliveryId
            })
            status = mode === 'preview' ? 'previewed' : 'sent'
            providerMessageId = response?.id ?? null
          }

          const completedAt = now()
          await orderRepository.saveEmailDelivery({
            id: deliveryId,
            eventId: event.id,
            orderId: order.id,
            templateId: message.templateId,
            audience: message.audience,
            status,
            providerMessageId,
            completedAt
          })
          logger.info?.(
            'E-mail transactionnel traité',
            createSafeLogData(message, status)
          )
          results.push({ deliveryId, status })
        } catch (error) {
          // Un refus définitif (adresse invalide, configuration de test, requête
          // rejetée) est mémorisé sans demander à Stripe de rejouer indéfiniment
          // le webhook. Les erreurs temporaires restent, elles, retentables.
          const status = error.retryable === false ? 'rejected' : 'failed'
          await orderRepository.saveEmailDelivery({
            id: deliveryId,
            eventId: event.id,
            orderId: order.id,
            templateId: message.templateId,
            audience: message.audience,
            status,
            errorCode: error.code ?? 'EMAIL_PROVIDER_ERROR',
            failedAt: now()
          })
          logger.error?.(
            'Échec e-mail transactionnel',
            createSafeLogData(message, status)
          )

          if (status === 'rejected') {
            results.push({ deliveryId, status })
            continue
          }

          throw new TransactionalEmailError(
            'Le fournisseur e-mail n’a pas confirmé l’envoi.',
            error.code ?? 'EMAIL_PROVIDER_ERROR'
          )
        }
      }

      return results
    }
  }
}

export { TransactionalEmailError }
