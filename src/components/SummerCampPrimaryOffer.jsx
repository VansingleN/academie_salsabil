import { useEffect, useState } from 'react'
import summerCampArch from '../images/summer_camp_arch.webp'
import { addCartItem } from '../utils/cart'
import { formatEuro } from '../utils/pricing'
import {
  getSummerCampDeposit,
  getSummerCampOfferId,
  getSummerCampPrice
} from '../data/summerCampPricing'

const primaryPrograms = [
  {
    id: 'doux',
    title: 'Programme doux',
    duration: '1 heure par jour',
    schedule: 'Du lundi au jeudi',
    description:
      'Un rythme léger pour entretenir les apprentissages tout en préservant pleinement le temps des vacances.'
  },
  {
    id: 'equilibre',
    title: 'Programme équilibre',
    duration: '1 h 30 par jour',
    schedule: 'Du lundi au jeudi',
    description:
      'Un format plus approfondi qui laisse davantage de place à la pratique, aux échanges et aux activités.'
  }
]

const primaryWorkshops = [
  {
    id: 'academiques',
    title: 'Ateliers académiques',
    description:
      'Consolider les acquis scolaires dans une ambiance détendue, avec des activités variées et accessibles.',
    activities: [
      'Soutien en français',
      'Soutien en mathématiques',
      'Lecture et compréhension',
      'Activités éducatives douces'
    ]
  },
  {
    id: 'religieux',
    title: 'Ateliers religieux',
    description:
      'Découvrir et approfondir des connaissances utiles à travers une approche vivante, adaptée aux enfants.',
    activities: [
      'Découverte de biographies',
      'Ateliers autour du Coran',
      'Initiation et pratique de l’arabe',
      'Repères et découvertes religieuses'
    ]
  }
]

const primaryDurations = [
  {
    id: 'une-semaine',
    title: 'Une semaine',
    label: 'Découvrir le Summer Camp',
    description:
      'Une première immersion pour profiter des ateliers, retrouver un rythme doux et vivre une semaine stimulante.'
  },
  {
    id: 'deux-semaines',
    title: 'Deux semaines',
    label: 'Approfondir les apprentissages',
    description:
      'Un temps plus long pour reprendre les notions avec sérénité, pratiquer davantage et consolider les premiers progrès.'
  },
  {
    id: 'un-mois',
    title: 'Un mois',
    label: 'Installer une vraie continuité',
    description:
      'Un accompagnement régulier pour avancer dans la durée, gagner en confiance et créer des habitudes positives.'
  }
]

const primaryAttendanceModes = [
  {
    id: 'personnalises',
    title: 'Ateliers personnalisés',
    eyebrow: 'Accompagnement individuel',
    description:
      'Un accompagnement entièrement individualisé, ajusté au rythme, aux besoins et aux objectifs de votre enfant.',
    detail: 'Un élève avec son intervenant'
  },
  {
    id: 'groupes',
    title: 'Ateliers groupés',
    eyebrow: 'Petit groupe',
    description:
      'Des ateliers vivants qui favorisent les échanges et l’émulation, dans un groupe volontairement limité.',
    detail: 'Effectif maximum de 6 élèves'
  }
]

const groupedWorkshopPeriods = [
  'Du 6 au 16 juillet 2026',
  'Du 20 au 30 juillet 2026',
  'Du 3 au 13 août 2026',
  'Du 17 au 27 août 2026'
]

function SummerCampPrimaryOffer({
  levelId = 'primary',
  title = 'Summer Camp Jeunes pousses',
  titleId = 'summer-camp-primary-title',
  groupedTime = '10 h 30 à 11 h 30'
}) {
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedWorkshop, setSelectedWorkshop] = useState('')
  const [selectedAttendanceMode, setSelectedAttendanceMode] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  const [hasAddedOnce, setHasAddedOnce] = useState(false)

  const workshop = primaryWorkshops.find((item) => item.id === selectedWorkshop)
  const attendanceMode = primaryAttendanceModes.find(
    (item) => item.id === selectedAttendanceMode
  )
  const duration = primaryDurations.find((item) => item.id === selectedDuration)
  const effectiveProgramId = selectedAttendanceMode === 'groupes'
    ? 'doux'
    : selectedProgram
  const effectiveProgram = primaryPrograms.find(
    (item) => item.id === effectiveProgramId
  )
  const availableDurations = selectedAttendanceMode === 'groupes'
    ? primaryDurations.filter((item) => item.id !== 'une-semaine')
    : primaryDurations
  const totalPrice = attendanceMode && effectiveProgram && duration
    ? getSummerCampPrice(attendanceMode.id, effectiveProgram.id, duration.id)
    : null
  const depositAmount = attendanceMode && duration
    ? getSummerCampDeposit(attendanceMode.id, duration.id)
    : 0
  const balanceAmount = totalPrice !== null
    ? totalPrice - depositAmount
    : null

  useEffect(() => {
    if (!addedToCart) return undefined

    const timer = window.setTimeout(() => setAddedToCart(false), 1200)
    return () => window.clearTimeout(timer)
  }, [addedToCart])

  const selectWorkshop = (workshopId) => {
    setSelectedWorkshop(workshopId)
    setSelectedAttendanceMode('')
    setSelectedProgram('')
    setSelectedDuration('')
    setAddedToCart(false)
    setHasAddedOnce(false)
  }

  const selectAttendanceMode = (attendanceModeId) => {
    setSelectedAttendanceMode(attendanceModeId)
    setSelectedProgram(attendanceModeId === 'groupes' ? 'doux' : '')
    setSelectedDuration('')
    setAddedToCart(false)
    setHasAddedOnce(false)
  }

  const selectProgram = (programId) => {
    setSelectedProgram(programId)
    setSelectedDuration('')
    setAddedToCart(false)
    setHasAddedOnce(false)
  }

  return (
    <section className="summer-camp-offer summer-camp-primary-offer" aria-labelledby={titleId}>
      <div className="summer-camp-offer__introduction">
        <div className="summer-camp-offer__visual">
          <img
            src={summerCampArch}
            alt="Illustration du Summer Camp de l’Académie Salsabil"
          />
        </div>

        <div className="summer-camp-offer__content">
          <div className="summer-camp-offer__heading">
            <span>Offre sélectionnée</span>
            <h2 id={titleId}>{title}</h2>
          </div>
          <p>
            Composez un programme adapté à votre enfant en choisissant ses ateliers,
            le type d’accompagnement, puis le rythme et la durée qui vous conviennent.
          </p>
          <div className="summer-camp-offer__schedule">
            <span>Calendrier des ateliers groupés</span>
            <strong>Du lundi au jeudi, de {groupedTime}</strong>
            <ul>
              {groupedWorkshopPeriods.map((period) => (
                <li key={period}>{period}</li>
              ))}
            </ul>
            <small>
              Pour les ateliers personnalisés, les horaires seront convenus avec la
              famille selon les disponibilités proposées.
            </small>
          </div>
        </div>
      </div>

      <div className="summer-camp-choice">
        <header className="summer-camp-choice__heading">
          <span>Étape 1</span>
          <h3>Choisissez les ateliers</h3>
          <p>Deux orientations pour offrir à votre enfant un été qui lui ressemble.</p>
        </header>

        <div className="summer-camp-workshop-options">
          {primaryWorkshops.map((item) => {
            const isSelected = selectedWorkshop === item.id

            return (
              <button
                className={`summer-camp-workshop-option${isSelected ? ' summer-camp-workshop-option--selected' : ''}`}
                type="button"
                aria-pressed={isSelected}
                key={item.id}
                onClick={() => selectWorkshop(item.id)}
              >
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <ul>
                  {item.activities.map((activity) => <li key={activity}>{activity}</li>)}
                </ul>
                <span>{isSelected ? 'Ateliers sélectionnés' : 'Choisir ces ateliers'}</span>
              </button>
            )
          })}
        </div>
      </div>

      {workshop && (
        <div className="summer-camp-choice">
          <header className="summer-camp-choice__heading">
            <span>Étape 2</span>
            <h3>Choisissez l’effectif souhaité</h3>
            <p>
              Un accompagnement individuel ou la dynamique d’un petit groupe,
              toujours dans un cadre attentif et bienveillant.
            </p>
          </header>

          <div className="summer-camp-attendance-options">
            {primaryAttendanceModes.map((item) => {
              const isSelected = selectedAttendanceMode === item.id

              return (
                <button
                  className={`summer-camp-attendance-option${isSelected ? ' summer-camp-attendance-option--selected' : ''}`}
                  type="button"
                  aria-pressed={isSelected}
                  key={item.id}
                  onClick={() => selectAttendanceMode(item.id)}
                >
                  <span>{item.eyebrow}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <strong>{item.detail}</strong>
                  <i aria-hidden="true"></i>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {workshop && selectedAttendanceMode === 'personnalises' && (
        <div className="summer-camp-choice">
          <header className="summer-camp-choice__heading">
            <span>Étape 3</span>
            <h3>Choisissez le rythme</h3>
            <p>Un format léger ou plus approfondi, toujours du lundi au jeudi.</p>
          </header>

          <div className="summer-camp-program-options">
            {primaryPrograms.map((item) => {
              const isSelected = selectedProgram === item.id

              return (
                <button
                  className={`summer-camp-program-option${isSelected ? ' summer-camp-program-option--selected' : ''}`}
                  type="button"
                  aria-pressed={isSelected}
                  key={item.id}
                  onClick={() => selectProgram(item.id)}
                >
                  <span>{item.schedule}</span>
                  <h4>{item.title}</h4>
                  <strong>{item.duration}</strong>
                  <p>{item.description}</p>
                  <i aria-hidden="true"></i>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {workshop && attendanceMode && effectiveProgram && (
        <div className="summer-camp-choice">
          <header className="summer-camp-choice__heading">
            <span>
              Étape {selectedAttendanceMode === 'personnalises' ? '4' : '3'}
            </span>
            <h3>Choisissez la durée</h3>
            <p>
              Une parenthèse courte ou un accompagnement plus régulier, selon les
              besoins et le rythme de votre famille.
            </p>
          </header>

          <div className="summer-camp-duration-options">
            {availableDurations.map((item) => {
              const isSelected = selectedDuration === item.id

              return (
                <button
                  className={`summer-camp-duration-option${isSelected ? ' summer-camp-duration-option--selected' : ''}`}
                  type="button"
                  aria-pressed={isSelected}
                  key={item.id}
                  onClick={() => {
                    setSelectedDuration(item.id)
                    setAddedToCart(false)
                    setHasAddedOnce(false)
                  }}
                >
                  <span>{item.label}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <i aria-hidden="true"></i>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedAttendanceMode === 'groupes' && (
        <details className="summer-camp-deposit-information">
          <summary>
            <span>
              <strong>Acompte de pré-réservation</strong>
              <small>Consulter les conditions des ateliers groupés</small>
            </span>
            <i aria-hidden="true"></i>
          </summary>
          <div className="summer-camp-deposit-information__content">
            <p>
              Pour garantir une organisation sérieuse des petits groupes, un acompte
              est demandé lors de la pré-réservation. Les groupes sont confirmés à
              partir de 2 élèves et limités à 6 élèves.
            </p>
            <ul>
              <li>
                Si aucun groupe adapté ne peut être constitué sur le créneau choisi,
                l’acompte est intégralement remboursé ou reporté sur un autre créneau,
                selon votre choix.
              </li>
              <li>
                Un changement de créneau peut être demandé jusqu’à 7 jours avant le
                début de l’accompagnement, sous réserve des places disponibles.
              </li>
              <li>
                Après confirmation du groupe, le solde est demandé par lien de
                paiement sécurisé et doit être réglé sous 72 heures. Un rappel est
                envoyé après 48 heures.
              </li>
              <li>
                Sans règlement dans ce délai, la place pourra être proposée à une
                autre famille. L’acompte restera disponible pour un report sur un
                autre créneau ou sous forme d’avoir, sous réserve des places.
              </li>
              <li>
                L’acompte n’est conservé définitivement qu’en cas d’annulation
                tardive claire par la famille, après le délai légal de rétractation,
                ou d’absence de réponse après plusieurs relances.
              </li>
            </ul>
          </div>
        </details>
      )}

      {effectiveProgram && workshop && attendanceMode && duration && (
        <div className="summer-camp-primary-summary" aria-live="polite">
          <span>Votre sélection</span>
          <p>{workshop.title}</p>
          <p>{attendanceMode.title}</p>
          <p>
            <strong>{effectiveProgram.title}</strong> · {effectiveProgram.duration},{' '}
            {effectiveProgram.schedule.toLowerCase()}
          </p>
          <p>{duration.title}</p>
          <div className="summer-camp-primary-summary__schedule">
            {attendanceMode.id === 'groupes' ? (
              <>
                <span>Créneau des ateliers groupés</span>
                <strong>Du lundi au jeudi · {groupedTime}</strong>
                <small>
                  Sessions disponibles : 6-16 juillet, 20-30 juillet,
                  3-13 août et 17-27 août 2026.
                </small>
              </>
            ) : (
              <>
                <span>Horaires des ateliers personnalisés</span>
                <strong>À convenir avec la famille</strong>
                <small>
                  Le créneau sera choisi ultérieurement parmi les disponibilités
                  proposées.
                </small>
              </>
            )}
          </div>
          <div className="summer-camp-primary-summary__total">
            <span>Prix final</span>
            <strong>{formatEuro(totalPrice)} HT</strong>
          </div>
          {depositAmount > 0 && (
            <div className="summer-camp-primary-summary__deposit">
              <p>
                <span>Acompte à régler maintenant</span>
                <strong>{formatEuro(depositAmount)} HT</strong>
              </p>
              <p>
                <span>Solde après confirmation du groupe</span>
                <strong>{formatEuro(balanceAmount)} HT</strong>
              </p>
              <small>
                L’acompte de pré-réservation est déduit du prix final. La place est
                définitivement validée après règlement du solde.
              </small>
            </div>
          )}
          <button
            type="button"
            disabled={addedToCart}
            onClick={() => {
              addCartItem({
                offerId: getSummerCampOfferId(
                  attendanceMode.id,
                  effectiveProgram.id,
                  duration.id,
                  levelId
                ),
                selections: { workshop: workshop.id }
              })
              setAddedToCart(true)
              setHasAddedOnce(true)
            }}
          >
            {addedToCart
              ? 'Ajouté au panier ✓'
              : hasAddedOnce
                ? 'Ajouter une autre inscription'
                : 'Ajouter au panier'}
          </button>
        </div>
      )}
    </section>
  )
}

export default SummerCampPrimaryOffer
