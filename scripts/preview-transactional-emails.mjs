import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  buildTransactionalEmailMessages
} from '../src/server/transactionalEmailTemplates.js'

const outputDirectory = resolve('email-previews')
const order = {
  id: 'ord_preview_email',
  publicOrderNumber: 'AS-2627-PREVIEW',
  status: 'scheduled',
  scheduleStatus: 'scheduled',
  futureInstallmentCount: 9,
  scheduleStartDate: '2026-10-07',
  paymentSummary: { firstPaymentExcludingTax: 419 },
  enrollment: {
    guardian: {
      firstName: 'Prénom test',
      email: 'famille@example.test'
    },
    students: [{
      cartItemId: 'preview-cp',
      firstName: 'Élève test'
    }]
  },
  items: [{
    cartItemId: 'preview-cp',
    curriculum: 'Primaire',
    grade: 'CP',
    plan: 'Mensuel',
    paymentSchedule: {
      futurePayments: [{ dueDate: '2026-10-07' }]
    }
  }]
}
const events = [
  {
    id: 'evt_preview_checkout',
    type: 'checkout.session.completed',
    data: { object: { payment_status: 'paid' } }
  },
  {
    id: 'evt_preview_paid',
    type: 'invoice.paid',
    data: { object: { amount_paid: 32900 } }
  },
  {
    id: 'evt_preview_failed',
    type: 'invoice.payment_failed',
    data: { object: { amount_due: 32900 } }
  },
  {
    id: 'evt_preview_cancelled',
    type: 'customer.subscription.deleted',
    data: { object: {} }
  }
]

await mkdir(outputDirectory, { recursive: true })

for (const event of events) {
  const messages = buildTransactionalEmailMessages({
    event,
    order,
    internalRecipient: 'equipe@example.test'
  })

  for (const message of messages) {
    const baseName = `${message.templateId}-${message.audience}`
    await writeFile(
      resolve(outputDirectory, `${baseName}.html`),
      message.html,
      'utf8'
    )
    await writeFile(
      resolve(outputDirectory, `${baseName}.txt`),
      message.text,
      'utf8'
    )
  }
}

console.log(`Prévisualisations générées dans ${outputDirectory}`)
