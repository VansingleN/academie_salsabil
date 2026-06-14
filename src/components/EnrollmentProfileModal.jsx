import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  billingAddressFields,
  consentDefinitions,
  createEnrollmentDraft,
  getStudentFields,
  guardianFields
} from '../data/enrollmentProfile'
import { getBillingCountryLabel } from '../data/countries'
import './EnrollmentProfileModal.css'

function FormField({ field, value, id, onChange }) {
  const today = new Date()
  const oldestBirthDate = new Date(today)
  const youngestBirthDate = new Date(today)

  oldestBirthDate.setFullYear(oldestBirthDate.getFullYear() - 25)
  youngestBirthDate.setFullYear(youngestBirthDate.getFullYear() - 2)

  const commonProps = {
    id,
    name: field.name,
    value,
    required: field.required,
    autoComplete: field.autoComplete,
    onChange: (event) => onChange(event.target.value)
  }

  if (field.type === 'select') {
    return (
      <select {...commonProps}>
        <option value="">Choisir</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        {...commonProps}
        rows="4"
        placeholder={field.placeholder}
      />
    )
  }

  return (
    <input
      {...commonProps}
      type={field.type}
      min={field.type === 'number'
        ? field.min
        : field.type === 'date'
          ? oldestBirthDate.toISOString().slice(0, 10)
          : undefined}
      max={field.type === 'number' ? field.max : (
        field.type === 'date'
          ? youngestBirthDate.toISOString().slice(0, 10)
          : undefined
      )}
    />
  )
}

function FieldGroup({ fields, values, idPrefix, onChange }) {
  return (
    <div className="enrollment-profile-fields">
      {fields.map((field) => {
        const fieldId = `${idPrefix}-${field.name}`

        return (
          <label
            className={field.type === 'textarea' ? 'field-wide' : ''}
            htmlFor={fieldId}
            key={field.name}
          >
            <span>
              {field.label}
              {!field.required && <small>Facultatif</small>}
            </span>
            <FormField
              field={field}
              value={values[field.name] ?? ''}
              id={fieldId}
              onChange={(value) => onChange(field.name, value)}
            />
          </label>
        )
      })}
    </div>
  )
}

function EnrollmentProfileModal({
  isOpen,
  cart,
  resolvedItems,
  billingCountry,
  submitting,
  submitError,
  onClose,
  onSubmit
}) {
  const [draft, setDraft] = useState(
    () => createEnrollmentDraft(cart, billingCountry)
  )

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, submitting])

  if (!isOpen) return null

  const updateSection = (section, name, value) => {
    setDraft((current) => ({
      ...current,
      [section]: { ...current[section], [name]: value }
    }))
  }

  const updateStudent = (cartItemId, name, value) => {
    setDraft((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.cartItemId === cartItemId
          ? { ...student, [name]: value }
          : student
      )
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(draft)
  }

  return createPortal(
    <div
      className="enrollment-profile-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose()
      }}
    >
      <section
        className="enrollment-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enrollment-profile-title"
      >
        <header className="enrollment-profile-header">
          <div>
            <span>Dossier d’inscription</span>
            <h2 id="enrollment-profile-title">Informations de la famille</h2>
            <p>
              Ces données sont associées à la commande et ne sont pas placées
              dans les métadonnées Stripe.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={onClose}
            disabled={submitting}
          >
            ×
          </button>
        </header>

        <form className="enrollment-profile-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>
              <span>01</span>
              Responsable légal
            </legend>
            <FieldGroup
              fields={guardianFields}
              values={draft.guardian}
              idPrefix="guardian"
              onChange={(name, value) =>
                updateSection('guardian', name, value)}
            />
          </fieldset>

          <fieldset>
            <legend>
              <span>02</span>
              Adresse de facturation
            </legend>
            <FieldGroup
              fields={billingAddressFields}
              values={draft.billingAddress}
              idPrefix="billing"
              onChange={(name, value) =>
                updateSection('billingAddress', name, value)}
            />
            <div className="enrollment-profile-country">
              <span>Pays de facturation</span>
              <strong>{getBillingCountryLabel(billingCountry)}</strong>
              <small>Repris du panier pour garantir la cohérence fiscale.</small>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <span>03</span>
              Élève{draft.students.length > 1 ? 's' : ''}
            </legend>
            <div className="enrollment-profile-students">
              {draft.students.map((student, index) => {
                const item = resolvedItems.find(
                  (candidate) => candidate.cartItemId === student.cartItemId
                )

                return (
                  <section
                    className="enrollment-profile-student"
                    key={student.cartItemId}
                  >
                    <header>
                      <span>Élève {index + 1}</span>
                      <strong>
                        {item?.curriculum} · {item?.gradeLongLabel}
                      </strong>
                    </header>
                    <FieldGroup
                      fields={getStudentFields(item)}
                      values={student}
                      idPrefix={`student-${index}`}
                      onChange={(name, value) =>
                        updateStudent(student.cartItemId, name, value)}
                    />
                  </section>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <span>04</span>
              Consentements
            </legend>
            <div className="enrollment-profile-consents">
              {consentDefinitions.map((consent) => (
                <label key={consent.name}>
                  <input
                    type="checkbox"
                    required
                    checked={draft.consents[consent.name].accepted}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        consents: {
                          ...current.consents,
                          [consent.name]: {
                            ...current.consents[consent.name],
                            accepted: event.target.checked
                          }
                        }
                      }))
                    }}
                  />
                  <span>
                    {consent.label}
                    <small>Version {consent.version}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {submitError && (
            <p className="enrollment-profile-error" role="alert">
              {submitError}
            </p>
          )}

          <footer>
            <p>
              L’horodatage définitif des consentements est créé par le serveur
              au moment de la commande.
            </p>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Préparation du paiement…' : 'Continuer vers Stripe'}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body
  )
}

export default EnrollmentProfileModal
