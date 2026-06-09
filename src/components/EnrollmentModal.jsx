import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { resolveCartItem } from '../data/offerCatalog'
import { createPaymentSchedule } from '../server/paymentSchedule'
import { formatDate, formatEuro } from '../utils/pricing'
import './EnrollmentModal.css'

function getInitialValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? '']))
}

function EnrollmentModal({
  isOpen,
  title,
  subtitle,
  offerId,
  fields = [],
  summary,
  submitLabel = 'Ajouter au panier',
  onClose,
  onSubmit
}) {
  const [values, setValues] = useState(() => getInitialValues(fields))
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fields, isOpen, onClose])

  if (!isOpen) return null

  const resolvedSummary = typeof summary === 'function' ? summary(values) : summary
  const previewItem = offerId
    ? resolveCartItem({ cartItemId: 'preview', offerId, selections: values })
    : null
  const paymentSchedule = previewItem && values.billingCountry
    ? createPaymentSchedule({
        offer: previewItem,
        countryCode: values.billingCountry
      })
    : null

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(values)
    setSubmitted(true)
  }

  return createPortal(
    <div
      className="enrollment-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="enrollment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enrollment-modal-title"
      >
        <header className="enrollment-modal-header">
          <div>
            <span>{subtitle}</span>
            <h2 id="enrollment-modal-title">{title}</h2>
          </div>
          <button
            className="enrollment-modal-close"
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form className="enrollment-modal-form" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label className="enrollment-modal-field" key={field.name}>
              <span>{field.label}</span>
              <select
                name={field.name}
                value={values[field.name]}
                required={field.required}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    [field.name]: event.target.value
                  }))
                  setSubmitted(false)
                }}
              >
                <option value="" disabled>
                  {field.placeholder}
                </option>
                {field.options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={
                      typeof option.disabled === 'function'
                        ? option.disabled(values)
                        : option.disabled
                    }
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <div className="enrollment-modal-summary">
            <span>{resolvedSummary.label}</span>
            <strong>{resolvedSummary.value}</strong>
          </div>

          <section className="enrollment-modal-schedule" aria-live="polite">
            <header>
              <span>Échéancier scolaire estimé</span>
              <strong>
                {paymentSchedule
                  ? `${formatEuro(paymentSchedule.totals.contractTotalExcludingTax)} HT`
                  : 'Choisissez le pays de facturation'}
              </strong>
            </header>

            {paymentSchedule ? (
              <>
                <div className="enrollment-modal-first-payment">
                  <div>
                    <span>Premier paiement · aujourd’hui</span>
                    <small>
                      {paymentSchedule.firstPayment.periodLabel} · du{' '}
                      {formatDate(paymentSchedule.firstPayment.periodStart)} au{' '}
                      {formatDate(paymentSchedule.firstPayment.periodEnd)}
                    </small>
                  </div>
                  <strong>
                    {formatEuro(paymentSchedule.totals.firstPaymentExcludingTax)} HT
                  </strong>
                </div>

                {paymentSchedule.firstPayment.proration?.applied && (
                  <p>
                    Prorata journalier : {paymentSchedule.firstPayment.proration.coveredDays}
                    {' '}jours sur {paymentSchedule.firstPayment.proration.totalDays}.
                  </p>
                )}

                {paymentSchedule.futurePayments.length > 0 && (
                  <div className="enrollment-modal-future-payments">
                    <span>Échéances futures</span>
                    <ul>
                      {paymentSchedule.futurePayments.map((installment) => (
                        <li key={`${installment.periodId}-${installment.dueDate}`}>
                          <span>{formatDate(installment.dueDate)} · {installment.periodLabel}</span>
                          <strong>{formatEuro(installment.subtotalExcludingTax)} HT</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p>
                  Taxes et total TTC en attente de configuration fiscale. L’adresse
                  Stripe restera la référence définitive avant paiement.
                </p>
              </>
            ) : (
              <p>
                Le pays est obligatoire avant l’ajout au panier. Aucun taux fiscal
                n’est encore appliqué.
              </p>
            )}
          </section>

          <button
            className={`enrollment-modal-submit${submitted ? ' enrollment-modal-submit--success' : ''}`}
            type="submit"
            disabled={submitted || !paymentSchedule}
          >
            {submitted ? 'Ajouté au panier' : submitLabel}
          </button>
        </form>
      </section>
    </div>,
    document.body
  )
}

export default EnrollmentModal
