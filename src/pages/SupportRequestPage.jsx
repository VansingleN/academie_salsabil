import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  formatSchoolSupportPrice,
  schoolSupportPricing
} from '../data/schoolSupportPricing'
import { submitSupportRequest } from '../utils/supportRequestApi'
import './SupportRequestPage.css'

const subjects = [
  'Français',
  'Mathématiques',
  'Histoire-géographie',
  'Anglais',
  'SVT',
  'Physique-chimie',
  'Technologie'
]

const initialForm = {
  parentName: '',
  email: '',
  phone: '',
  studentAge: '',
  level: '',
  subjects: [],
  needType: 'regulier',
  format: 'individual',
  weeklyVolume: '1',
  startDate: '',
  availability: '',
  objective: '',
  preferredContact: 'telephone',
  consent: false,
  website: '',
  formStartedAt: ''
}

function SupportRequestPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialMode = searchParams.get('parcours') === 'conseil' ? 'advice' : 'slot'
  const initialNeedType =
    searchParams.get('type') === 'ponctuel' ? 'ponctuel' : 'regulier'
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({
    ...initialForm,
    needType: initialNeedType,
    formStartedAt: new Date().toISOString()
  })
  const [submission, setSubmission] = useState({
    status: 'idle',
    reference: '',
    message: ''
  })

  const selectedPrice = useMemo(() => {
    if (form.format === 'group') return schoolSupportPricing.group
    return schoolSupportPricing.individual
  }, [form.format])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const toggleSubject = (subject) => {
    setForm((current) => ({
      ...current,
      subjects: current.subjects.includes(subject)
        ? current.subjects.filter((item) => item !== subject)
        : [...current.subjects, subject]
    }))
  }

  const selectMode = (nextMode) => {
    setMode(nextMode)
    setSubmission({ status: 'idle', reference: '', message: '' })
    setSearchParams({ parcours: nextMode === 'advice' ? 'conseil' : 'creneau' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmission({ status: 'loading', reference: '', message: '' })

    try {
      const result = await submitSupportRequest({ ...form, mode })
      setSubmission({
        status: 'success',
        reference: result.reference,
        message: ''
      })
    } catch (error) {
      setSubmission({
        status: 'error',
        reference: '',
        message:
          error instanceof Error
            ? error.message
            : 'La demande n’a pas pu être enregistrée.'
      })
    }

    requestAnimationFrame(() => {
      document
        .querySelector('.support-request-feedback')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  return (
    <main className="support-request-page">
      <section className="support-request-hero" aria-labelledby="support-request-title">
        <div>
          <Link to="/soutien-scolaire">← Retour au soutien scolaire</Link>
          <span>Votre demande de soutien</span>
          <h1 id="support-request-title">
            Trouver un accompagnement adapté, simplement
          </h1>
          <p>
            Choisissez le parcours qui correspond à votre situation. Une demande de
            créneau ne vaut pas encore réservation : nous validons avec vous le besoin,
            la disponibilité et le tarif avant tout engagement.
          </p>
        </div>
      </section>

      <section className="support-request-layout">
        <div className="support-request-main">
          <div className="support-request-modes" aria-label="Choisir un parcours">
            <button
              type="button"
              className={mode === 'slot' ? 'is-active' : ''}
              onClick={() => selectMode('slot')}
              aria-pressed={mode === 'slot'}
            >
              <span>Mon besoin est défini</span>
              <strong>Demander un créneau</strong>
              <small>
                Je connais les matières, le rythme ou la période souhaitée.
              </small>
            </button>
            <button
              type="button"
              className={mode === 'advice' ? 'is-active' : ''}
              onClick={() => selectMode('advice')}
              aria-pressed={mode === 'advice'}
            >
              <span>J’ai besoin d’être orienté</span>
              <strong>Être conseillé</strong>
              <small>
                Je présente la situation et l’équipe m’aide à construire la formule.
              </small>
            </button>
          </div>

          <form className="support-request-form" onSubmit={handleSubmit}>
            <div className="support-request-honeypot" aria-hidden="true">
              <label>
                Votre site internet
                <input
                  name="website"
                  value={form.website}
                  onChange={updateField}
                  tabIndex="-1"
                  autoComplete="off"
                />
              </label>
            </div>
            <header>
              <span>{mode === 'slot' ? 'Pré-demande de créneau' : 'Demande de conseil'}</span>
              <h2>
                {mode === 'slot'
                  ? 'Précisons l’accompagnement recherché'
                  : 'Parlez-nous de la situation de l’élève'}
              </h2>
              <p>
                Les champs marqués d’un astérisque sont nécessaires pour pouvoir vous
                recontacter avec une réponse pertinente.
              </p>
            </header>

            <fieldset>
              <legend>Vos coordonnées</legend>
              <div className="support-request-fields">
                <label>
                  Nom du parent ou responsable *
                  <input
                    name="parentName"
                    value={form.parentName}
                    onChange={updateField}
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  Adresse e-mail *
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Téléphone *
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    autoComplete="tel"
                    required
                  />
                </label>
                <label>
                  Moyen de contact préféré
                  <select
                    name="preferredContact"
                    value={form.preferredContact}
                    onChange={updateField}
                  >
                    <option value="telephone">Téléphone</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                  </select>
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Profil de l’élève</legend>
              <div className="support-request-fields">
                <label>
                  Âge de l’élève *
                  <input
                    type="number"
                    min="5"
                    max="20"
                    name="studentAge"
                    value={form.studentAge}
                    onChange={updateField}
                    required
                  />
                </label>
                <label>
                  Classe ou niveau actuel *
                  <input
                    name="level"
                    value={form.level}
                    onChange={updateField}
                    placeholder="Ex. CM2, 4e, seconde"
                    required
                  />
                </label>
              </div>
            </fieldset>

            {mode === 'slot' && (
              <>
                <fieldset>
                  <legend>Matières concernées *</legend>
                  <div className="support-request-options support-request-options--subjects">
                    {subjects.map((subject) => (
                      <label key={subject}>
                        <input
                          type="checkbox"
                          checked={form.subjects.includes(subject)}
                          onChange={() => toggleSubject(subject)}
                        />
                        <span>{subject}</span>
                      </label>
                    ))}
                  </div>
                  {form.subjects.length === 0 && (
                    <p className="support-request-hint">
                      Sélectionnez au moins une matière avant l’envoi.
                    </p>
                  )}
                </fieldset>

                <fieldset>
                  <legend>Organisation souhaitée</legend>
                  <div className="support-request-fields">
                    <label>
                      Type de besoin
                      <select name="needType" value={form.needType} onChange={updateField}>
                        <option value="regulier">Soutien régulier</option>
                        <option value="ponctuel">Besoin ponctuel</option>
                      </select>
                    </label>
                    <label>
                      Format préféré
                      <select name="format" value={form.format} onChange={updateField}>
                        <option value="individual">Individuel</option>
                        <option value="group">Petit groupe</option>
                        <option value="undecided">Sans préférence</option>
                      </select>
                    </label>
                    <label>
                      Volume envisagé
                      <select
                        name="weeklyVolume"
                        value={form.weeklyVolume}
                        onChange={updateField}
                      >
                        <option value="1">1 heure par semaine</option>
                        <option value="2">2 heures par semaine</option>
                        <option value="3+">3 heures ou plus par semaine</option>
                        <option value="single">Une séance ponctuelle</option>
                      </select>
                    </label>
                    <label>
                      Date de début souhaitée
                      <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={updateField}
                      />
                    </label>
                  </div>
                </fieldset>
              </>
            )}

            <fieldset>
              <legend>
                {mode === 'slot' ? 'Objectif et disponibilités' : 'Votre besoin'}
              </legend>
              <label className="support-request-full-field">
                {mode === 'slot'
                  ? 'Objectif principal ou difficultés rencontrées *'
                  : 'Difficultés rencontrées, matières et objectif recherché *'}
                <textarea
                  name="objective"
                  value={form.objective}
                  onChange={updateField}
                  rows="5"
                  placeholder={
                    mode === 'slot'
                      ? 'Ex. reprendre les fractions et préparer le prochain contrôle…'
                      : 'Décrivez librement la situation afin que nous puissions vous orienter…'
                  }
                  required
                />
              </label>
              <label className="support-request-full-field">
                Disponibilités pour les séances ou pour un échange *
                <textarea
                  name="availability"
                  value={form.availability}
                  onChange={updateField}
                  rows="3"
                  placeholder="Ex. mardi et jeudi après 17 h, samedi matin…"
                  required
                />
              </label>
            </fieldset>

            {mode === 'slot' && (
              <div className="support-request-estimate">
                <span>Repère tarifaire selon votre sélection</span>
                <strong>
                  {form.format === 'undecided'
                    ? `À partir de ${formatSchoolSupportPrice(
                        schoolSupportPricing.group.amount
                      )}`
                    : `À partir de ${formatSchoolSupportPrice(selectedPrice.amount)}`}
                </strong>
                <small>
                  {form.format === 'group'
                    ? schoolSupportPricing.group.unit
                    : form.format === 'undecided'
                      ? 'selon le format retenu'
                      : schoolSupportPricing.individual.unit}
                  . Le tarif final est confirmé avant le démarrage.
                </small>
              </div>
            )}

            <label className="support-request-consent">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={updateField}
                aria-describedby="support-request-privacy-note"
                required
              />
              <span>
                J’accepte d’être recontacté au sujet de cette demande. *
              </span>
            </label>
            <p
              className="support-request-privacy-note"
              id="support-request-privacy-note"
            >
              Ces informations permettent d’étudier votre demande et de vous
              recontacter. Elles sont traitées pendant 12 mois au maximum, puis
              supprimées après un délai technique de 30 jours. Une clôture
              anticipée réduit cette durée.{' '}
              <Link to="/politique-de-confidentialite">En savoir plus</Link>.
            </p>

            <button
              className="support-request-submit"
              type="submit"
              disabled={
                submission.status === 'loading' ||
                (mode === 'slot' && form.subjects.length === 0)
              }
            >
              {submission.status === 'loading'
                ? 'Enregistrement…'
                : mode === 'slot'
                  ? 'Envoyer ma pré-demande'
                  : 'Demander à être conseillé'}
            </button>

            {submission.status === 'success' && (
              <div
                className="support-request-feedback support-request-success"
                role="status"
              >
                <strong>Votre demande a bien été enregistrée.</strong>
                <p>
                  Conservez cette référence : <b>{submission.reference}</b>. L’équipe
                  pourra retrouver votre demande dès que le suivi commercial sera
                  activé.
                </p>
              </div>
            )}

            {submission.status === 'error' && (
              <div
                className="support-request-feedback support-request-error"
                role="alert"
              >
                <strong>La demande n’a pas été enregistrée.</strong>
                <p>{submission.message}</p>
              </div>
            )}
          </form>
        </div>

        <aside className="support-request-aside" aria-label="Tarifs et modalités">
          <span>Repères pratiques</span>
          <h2>Une proposition claire avant de commencer</h2>

          <div className="support-request-price">
            <strong>
              Dès {formatSchoolSupportPrice(schoolSupportPricing.individual.amount)}
            </strong>
            <p>en individuel, {schoolSupportPricing.individual.unit}</p>
          </div>
          <div className="support-request-price">
            <strong>
              Dès {formatSchoolSupportPrice(schoolSupportPricing.group.amount)}
            </strong>
            <p>
              en petit groupe, {schoolSupportPricing.group.unit}
            </p>
          </div>

          <ul>
            <li>Séances en ligne de {schoolSupportPricing.standardSessionMinutes} minutes</li>
            <li>
              Format de {schoolSupportPricing.extendedSessionMinutes} minutes possible
              selon le niveau et l’objectif
            </li>
            <li>Pas d’engagement annuel imposé</li>
            <li>Paiement demandé uniquement après validation de la proposition</li>
          </ul>

          <details>
            <summary>Voir les conditions proposées</summary>
            <p>
              La demande reste soumise aux disponibilités. La famille reçoit le cadre,
              le tarif et le créneau proposés avant de confirmer.
            </p>
            <p>
              Une séance peut être déplacée sans frais jusqu’à{' '}
              {schoolSupportPricing.rescheduleNoticeHours} h avant son début. Passé ce
              délai, elle peut rester due, sauf situation exceptionnelle étudiée avec
              la famille.
            </p>
            <p>
              Une proposition de créneau est conservée pendant{' '}
              {schoolSupportPricing.proposalValidityHours} h. Les petits groupes sont
              constitués de {schoolSupportPricing.group.minimumStudents} à{' '}
              {schoolSupportPricing.group.maximumStudents} élèves.
            </p>
          </details>
        </aside>
      </section>
    </main>
  )
}

export default SupportRequestPage
