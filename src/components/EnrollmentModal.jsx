import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './EnrollmentModal.css'

function getInitialValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? '']))
}

function EnrollmentModal({
  isOpen,
  title,
  subtitle,
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

          <button
            className={`enrollment-modal-submit${submitted ? ' enrollment-modal-submit--success' : ''}`}
            type="submit"
            disabled={submitted}
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
