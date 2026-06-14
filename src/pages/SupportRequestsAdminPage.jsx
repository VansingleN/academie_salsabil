import { useEffect, useState } from 'react'
import {
  changeSupportRequestStatus,
  getSupportRequests,
  removeSupportRequest
} from '../utils/supportRequestAdminApi'
import {
  changeContactMessageStatus,
  getContactMessages,
  removeContactMessage
} from '../utils/contactMessageApi'
import { getAdministrativeOrders } from '../utils/orderAdminApi'
import { downloadAdministrativeExport } from '../utils/adminExportApi'
import './SupportRequestsAdminPage.css'

const SESSION_KEY = 'academie-salsabil-support-admin-key'
const PAGE_SIZE = 10
const ADMIN_SESSION_ERROR_STATUSES = new Set([401, 403, 429, 503])

const statusLabels = {
  new: 'Nouvelle',
  contacted: 'Contactée',
  closed: 'Traitée'
}

const modeLabels = {
  slot: 'Demande de créneau',
  advice: 'Demande de conseil'
}

const orderStatusLabels = {
  checkout_created: 'Paiement commencé',
  checkout_completed: 'Checkout terminé',
  expired: 'Session expirée',
  deposit_paid: 'Acompte payé',
  initial_payment_paid: 'Premier paiement reçu',
  paid: 'Payée',
  active: 'Active',
  past_due: 'Impayée',
  cancelled: 'Annulée',
  scheduled: 'Échéancier actif',
  schedule_failed: 'Échéancier en erreur'
}

const formatEuro = (amount) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount ?? 0)

const formatRetentionDate = (value) =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long'
  }).format(new Date(value))

const initialPagination = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
  from: 0,
  to: 0
}

function SupportRequestsAdminPage() {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem(SESSION_KEY) ?? ''
  )
  const [draftKey, setDraftKey] = useState(adminKey)
  const [requests, setRequests] = useState([])
  const [section, setSection] = useState('support')
  const [pagination, setPagination] = useState(initialPagination)
  const [page, setPage] = useState(1)
  const [draftSearch, setDraftSearch] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('newest')
  const [refreshKey, setRefreshKey] = useState(0)
  const [state, setState] = useState(adminKey ? 'loading' : 'locked')
  const [exportingFormat, setExportingFormat] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!adminKey) return undefined

    let active = true

    const request = section === 'support'
      ? getSupportRequests
      : section === 'contact'
        ? getContactMessages
        : getAdministrativeOrders

    request(adminKey, {
      page,
      pageSize: PAGE_SIZE,
      search,
      status,
      sort
    })
      .then((result) => {
        if (!active) return
        const nextPagination = result.pagination ?? initialPagination
        const items = section === 'support'
          ? result.requests
          : section === 'contact'
            ? result.messages
            : result.orders
        setRequests(Array.isArray(items) ? items : [])
        setPagination(nextPagination)
        setPage(nextPagination.page)
        setState('ready')
      })
      .catch((error) => {
        if (!active) return
        if (ADMIN_SESSION_ERROR_STATUSES.has(error.status)) {
          sessionStorage.removeItem(SESSION_KEY)
          setAdminKey('')
          setState('locked')
        } else {
          setState('ready')
        }
        setMessage(error.message)
      })

    return () => {
      active = false
    }
  }, [adminKey, page, refreshKey, search, section, sort, status])

  const unlock = (event) => {
    event.preventDefault()
    const key = draftKey.trim()
    if (!key) return
    sessionStorage.setItem(SESSION_KEY, key)
    setMessage('')
    setState('loading')
    setAdminKey(key)
  }

  const applySearch = (event) => {
    event.preventDefault()
    setMessage('')
    setState('loading')
    setPage(1)
    setSearch(draftSearch.trim())
  }

  const clearFilters = () => {
    setMessage('')
    setState('loading')
    setDraftSearch('')
    setSearch('')
    setStatus('all')
    setSort('newest')
    setPage(1)
  }

  const changeSection = (nextSection) => {
    setSection(nextSection)
    setRequests([])
    setPagination(initialPagination)
    setPage(1)
    setDraftSearch('')
    setSearch('')
    setStatus('all')
    setSort('newest')
    setMessage('')
    setState('loading')
  }

  const changePage = (nextPage) => {
    setMessage('')
    setState('loading')
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const refreshRequests = () => {
    setMessage('')
    setState('loading')
    setRefreshKey((current) => current + 1)
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAdminKey('')
    setDraftKey('')
    setRequests([])
    setPagination(initialPagination)
    setMessage('')
    setState('locked')
  }

  const exportSection = async (format) => {
    setMessage('')
    setExportingFormat(format)

    try {
      await downloadAdministrativeExport(adminKey, section, format)
    } catch (error) {
      if (ADMIN_SESSION_ERROR_STATUSES.has(error.status)) {
        sessionStorage.removeItem(SESSION_KEY)
        setAdminKey('')
        setState('locked')
      }
      setMessage(error.message)
    } finally {
      setExportingFormat('')
    }
  }

  const updateStatus = async (requestId, nextStatus) => {
    setMessage('')

    try {
      if (section === 'support') {
        await changeSupportRequestStatus(adminKey, requestId, nextStatus)
      } else {
        await changeContactMessageStatus(adminKey, requestId, nextStatus)
      }
      refreshRequests()
    } catch (error) {
      if (ADMIN_SESSION_ERROR_STATUSES.has(error.status)) {
        sessionStorage.removeItem(SESSION_KEY)
        setAdminKey('')
        setState('locked')
      }
      setMessage(error.message)
    }
  }

  const deleteRequest = async (request) => {
    const confirmed = window.confirm(
      `Supprimer définitivement ${
        section === 'support' ? 'la demande' : 'le message'
      } ${request.reference} ?`
    )
    if (!confirmed) return

    try {
      if (section === 'support') {
        await removeSupportRequest(adminKey, request.id)
      } else {
        await removeContactMessage(adminKey, request.id)
      }

      if (requests.length === 1 && page > 1) {
        setState('loading')
        setPage((current) => current - 1)
      } else {
        refreshRequests()
      }
    } catch (error) {
      if (ADMIN_SESSION_ERROR_STATUSES.has(error.status)) {
        sessionStorage.removeItem(SESSION_KEY)
        setAdminKey('')
        setState('locked')
      }
      setMessage(error.message)
    }
  }

  if (state === 'locked') {
    return (
      <main className="support-admin support-admin--locked">
        <form onSubmit={unlock}>
          <span>Espace confidentiel</span>
          <h1>Suivi des contacts</h1>
          <p>
            Saisissez la clé d’administration configurée dans Netlify pour consulter
            les demandes enregistrées.
          </p>
          <label>
            Clé d’accès
            <input
              type="password"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit">Accéder aux demandes</button>
          {message && <p className="support-admin__error">{message}</p>}
        </form>
      </main>
    )
  }

  const hasActiveFilters = Boolean(search) || status !== 'all' || sort !== 'newest'

  return (
    <main className="support-admin">
      <nav className="support-admin__sections" aria-label="Type de demandes">
        <button
          type="button"
          className={section === 'support' ? 'is-active' : ''}
          onClick={() => changeSection('support')}
        >
          Demandes de soutien
        </button>
        <button
          type="button"
          className={section === 'contact' ? 'is-active' : ''}
          onClick={() => changeSection('contact')}
        >
          Messages de contact
        </button>
        <button
          type="button"
          className={section === 'orders' ? 'is-active' : ''}
          onClick={() => changeSection('orders')}
        >
          Commandes et inscriptions
        </button>
      </nav>

      <header className="support-admin__header">
        <div>
          <span>Espace confidentiel</span>
          <h1>
            {section === 'support'
              ? 'Demandes de soutien'
              : section === 'contact'
                ? 'Messages de contact'
                : 'Commandes et inscriptions'}
          </h1>
          <p>
            {pagination.totalItems}{' '}
            {section === 'support'
              ? 'demande'
              : section === 'contact'
                ? 'message'
                : 'commande'}
            {pagination.totalItems > 1 ? 's' : ''} trouvée
            {pagination.totalItems > 1 ? 's' : ''}
          </p>
        </div>
        <div className="support-admin__header-actions">
          <button
            type="button"
            className="support-admin__secondary-action"
            onClick={() => exportSection('csv')}
            disabled={Boolean(exportingFormat)}
            title="Exporte tous les éléments de cette rubrique"
          >
            {exportingFormat === 'csv' ? 'Export…' : 'Exporter CSV'}
          </button>
          <button
            type="button"
            className="support-admin__secondary-action"
            onClick={() => exportSection('json')}
            disabled={Boolean(exportingFormat)}
            title="Exporte tous les éléments de cette rubrique"
          >
            {exportingFormat === 'json' ? 'Export…' : 'Exporter JSON'}
          </button>
          <button type="button" onClick={refreshRequests}>
            {state === 'loading' ? 'Actualisation…' : 'Actualiser'}
          </button>
          <button
            type="button"
            className="support-admin__logout"
            onClick={logout}
          >
            Se déconnecter
          </button>
        </div>
      </header>

      <p className="support-admin__export-note">
        Les exports contiennent l’ensemble des données de cette rubrique, y
        compris les informations personnelles. Conservez-les dans un
        emplacement protégé.
      </p>

      <section className="support-admin__toolbar" aria-label="Filtrer les demandes">
        <form onSubmit={applySearch}>
          <label>
            Rechercher
            <input
              type="search"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder={
                section === 'support'
                  ? 'Nom, référence, e-mail, niveau…'
                  : section === 'contact'
                    ? 'Nom, référence, e-mail, message…'
                    : 'Commande, responsable, élève, offre…'
              }
            />
          </label>
          <button type="submit">Rechercher</button>
        </form>

        <label>
          Statut
          <select
            value={status}
            onChange={(event) => {
              setState('loading')
              setPage(1)
              setStatus(event.target.value)
            }}
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(
              section === 'orders' ? orderStatusLabels : statusLabels
            ).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>

        <label>
          Trier
          <select
            value={sort}
            onChange={(event) => {
              setState('loading')
              setPage(1)
              setSort(event.target.value)
            }}
          >
            <option value="newest">Plus récentes</option>
            <option value="oldest">Plus anciennes</option>
          </select>
        </label>

        {hasActiveFilters && (
          <button
            className="support-admin__clear"
            type="button"
            onClick={clearFilters}
          >
            Réinitialiser
          </button>
        )}
      </section>

      {message && <p className="support-admin__error">{message}</p>}

      {state === 'loading' && requests.length === 0 ? (
        <p className="support-admin__empty">Chargement des éléments…</p>
      ) : requests.length === 0 ? (
        <p className="support-admin__empty">
          Aucun élément ne correspond à ces critères.
        </p>
      ) : (
        <>
          <p className="support-admin__range">
            Affichage de {pagination.from} à {pagination.to} sur{' '}
            {pagination.totalItems}
          </p>

          <div className={`support-admin__list${state === 'loading' ? ' is-loading' : ''}`}>
            {requests.map((request) => section === 'orders' ? (
              <article className="support-admin-card support-admin-order" key={request.id}>
                <header>
                  <div>
                    <span>Commande Stripe</span>
                    <h2>{request.publicOrderNumber}</h2>
                    <small>
                      {new Intl.DateTimeFormat('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }).format(new Date(request.createdAt))}
                    </small>
                    <p className="support-admin-card__summary">
                      {request.guardian
                        ? `${request.guardian.firstName} ${request.guardian.lastName}`
                        : 'Responsable non renseigné'}
                      {' · '}
                      {request.itemCount} inscription
                      {request.itemCount > 1 ? 's' : ''}
                      {' · '}
                      {formatEuro(request.paymentSummary.contractTotalExcludingTax)} HT
                    </p>
                  </div>
                  <span className={`support-admin-order__status support-admin-order__status--${request.status}`}>
                    {orderStatusLabels[request.status] ?? request.status}
                  </span>
                </header>

                <details className="support-admin-card__details">
                  <summary>Voir le dossier et le paiement</summary>

                  <div className="support-admin-order__overview">
                    <section>
                      <h3>Responsable légal</h3>
                      {request.guardian ? (
                        <>
                          <p>{request.guardian.firstName} {request.guardian.lastName}</p>
                          <a href={`mailto:${request.guardian.email}`}>
                            {request.guardian.email}
                          </a>
                          <a href={`tel:${request.guardian.phone}`}>
                            {request.guardian.phone}
                          </a>
                        </>
                      ) : <p>Non renseigné</p>}
                    </section>
                    <section>
                      <h3>Facturation</h3>
                      {request.billingAddress ? (
                        <>
                          <p>{request.billingAddress.line1}</p>
                          {request.billingAddress.line2 && <p>{request.billingAddress.line2}</p>}
                          <p>
                            {request.billingAddress.postalCode} {request.billingAddress.city}
                            {' · '}{request.billingAddress.countryCode}
                          </p>
                        </>
                      ) : <p>Non renseignée</p>}
                    </section>
                    <section>
                      <h3>Paiement</h3>
                      <p>Premier paiement : {formatEuro(request.paymentSummary.firstPaymentExcludingTax)} HT</p>
                      <p>Échéances futures : {formatEuro(request.paymentSummary.futurePaymentsExcludingTax)} HT</p>
                      <p>Total contractuel : {formatEuro(request.paymentSummary.contractTotalExcludingTax)} HT</p>
                      <p>État Stripe : {request.paymentStatus}</p>
                    </section>
                  </div>

                  <div className="support-admin-order__entries">
                    {request.entries.map((entry) => (
                      <section key={entry.cartItemId}>
                        <header>
                          <div>
                            <h3>{entry.curriculum} · {entry.grade}</h3>
                            <p>{entry.plan} · {entry.billingCountry}</p>
                          </div>
                          <strong>{formatEuro(entry.contractTotalExcludingTax)} HT</strong>
                        </header>
                        {entry.student && (
                          <div className="support-admin-order__student">
                            <p>
                              <b>Élève :</b> {entry.student.firstName} {entry.student.lastName}
                            </p>
                            {entry.student.birthDate && <p>Naissance : {entry.student.birthDate}</p>}
                            {entry.student.age != null && <p>Âge : {entry.student.age} ans</p>}
                            {entry.student.schoolGrade && <p>Classe : {entry.student.schoolGrade}</p>}
                            {entry.student.learningObjectives && (
                              <p><b>Objectifs :</b> {entry.student.learningObjectives}</p>
                            )}
                            {entry.student.accommodations && (
                              <p><b>Aménagements :</b> {entry.student.accommodations}</p>
                            )}
                          </div>
                        )}
                        {entry.selectedOptions.length > 0 && (
                          <ul>
                            {entry.selectedOptions.map((option) => (
                              <li key={`${entry.cartItemId}-${option.name}`}>
                                {option.label} : {option.value}
                              </li>
                            ))}
                          </ul>
                        )}
                        <small>
                          {entry.futurePaymentCount} échéance
                          {entry.futurePaymentCount > 1 ? 's' : ''} future
                          {entry.futurePaymentCount > 1 ? 's' : ''}
                          {entry.manualPaymentCount > 0
                            ? ` · ${entry.manualPaymentCount} règlement manuel`
                            : ''}
                        </small>
                      </section>
                    ))}
                  </div>

                  <section className="support-admin-order__technical">
                    <h3>Références techniques</h3>
                    <p>Commande interne : {request.id}</p>
                    <p>Session Stripe : {request.checkoutSessionId ?? 'Non disponible'}</p>
                    <p>Abonnement : {request.subscriptionId ?? 'Non créé'}</p>
                    <p>Échéancier : {request.scheduleStatus}</p>
                  </section>
                </details>
              </article>
            ) : (
              <article className="support-admin-card" key={request.id}>
                {request.retention?.scheduledDeletionAt && (
                  <p className="support-admin-card__retention" role="status">
                    Suppression automatique prévue le{' '}
                    <strong>
                      {formatRetentionDate(request.retention.scheduledDeletionAt)}
                    </strong>
                    . Vérifiez ou traitez cet élément avant cette date.
                  </p>
                )}
                <header>
                  <div>
                    <span>
                      {section === 'support'
                        ? modeLabels[request.mode]
                        : 'Message général'}
                    </span>
                    <h2>
                      {section === 'support'
                        ? request.contact.parentName
                        : `${request.contact.firstname} ${request.contact.lastname}`}
                    </h2>
                    <small>
                      {request.reference} ·{' '}
                      {new Intl.DateTimeFormat('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }).format(new Date(request.createdAt))}
                    </small>
                    <p className="support-admin-card__summary">
                      {section === 'support'
                        ? `${request.student.age} ans · ${request.student.level}${
                            request.request.subjects.length > 0
                              ? ` · ${request.request.subjects.join(', ')}`
                              : ''
                          }`
                        : request.message}
                    </p>
                  </div>
                  <select
                    value={request.status}
                    onChange={(event) => updateStatus(request.id, event.target.value)}
                    aria-label={`Statut de ${request.reference}`}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </header>

                <details className="support-admin-card__details">
                  <summary>
                    Voir le détail {section === 'support' ? 'de la demande' : 'du message'}
                  </summary>

                  {section === 'support' ? (
                    <>
                      <div className="support-admin-card__grid">
                        <section>
                          <h3>Contact</h3>
                          <a href={`mailto:${request.contact.email}`}>
                            {request.contact.email}
                          </a>
                          <a href={`tel:${request.contact.phone}`}>
                            {request.contact.phone}
                          </a>
                          <p>Préférence : {request.contact.preferredMethod}</p>
                        </section>
                        <section>
                          <h3>Élève</h3>
                          <p>{request.student.age} ans · {request.student.level}</p>
                          {request.request.subjects.length > 0 && (
                            <p>{request.request.subjects.join(', ')}</p>
                          )}
                        </section>
                        <section>
                          <h3>Organisation</h3>
                          <p>
                            {request.request.needType ?? 'À définir'} ·{' '}
                            {request.request.format ?? 'À définir'} ·{' '}
                            {request.request.weeklyVolume
                              ? `${request.request.weeklyVolume} h`
                              : 'Rythme à définir'}
                          </p>
                          <p>{request.request.availability}</p>
                        </section>
                      </div>

                      <section className="support-admin-card__objective">
                        <h3>Besoin exprimé</h3>
                        <p>{request.request.objective}</p>
                      </section>
                    </>
                  ) : (
                    <div className="support-admin-card__grid support-admin-card__grid--contact">
                      <section>
                        <h3>Coordonnées</h3>
                        <a href={`mailto:${request.contact.email}`}>
                          {request.contact.email}
                        </a>
                        {request.contact.phone && (
                          <a href={`tel:${request.contact.phone}`}>
                            {request.contact.phone}
                          </a>
                        )}
                      </section>
                      <section className="support-admin-card__objective">
                        <h3>Message</h3>
                        <p>{request.message}</p>
                      </section>
                    </div>
                  )}

                  <button
                    className="support-admin-card__delete"
                    type="button"
                    onClick={() => deleteRequest(request)}
                  >
                    Supprimer {section === 'support' ? 'la demande' : 'le message'}
                  </button>
                </details>
              </article>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <nav className="support-admin__pagination" aria-label="Pagination">
              <button
                type="button"
                disabled={pagination.page === 1 || state === 'loading'}
                onClick={() => changePage(pagination.page - 1)}
              >
                Précédente
              </button>
              <span>
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={
                  pagination.page === pagination.totalPages || state === 'loading'
                }
                onClick={() => changePage(pagination.page + 1)}
              >
                Suivante
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  )
}

export default SupportRequestsAdminPage
