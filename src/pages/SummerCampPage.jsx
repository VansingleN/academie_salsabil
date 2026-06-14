import { useSearchParams } from 'react-router-dom'
import SummerCampCollegeOffer from '../components/SummerCampCollegeOffer'
import SummerCampPrimaryOffer from '../components/SummerCampPrimaryOffer'
import collegeCardImage from '../images/card_college.webp'
import primaryCardImage from '../images/card_primaire.webp'
import seedMascot from '../images/seed_mascot.webp'
import treeMascot from '../images/tree_mascot.webp'
import './SummerCampPage.css'

const levels = [
  {
    id: 'primaire',
    title: 'Jeunes pousses',
    subtitle: 'Pour les enfants de 6 à 10 ans',
    image: primaryCardImage,
    mascot: seedMascot
  },
  {
    id: 'college',
    title: 'Adolescents',
    subtitle: 'Pour les jeunes de 11 à 15 ans',
    image: collegeCardImage,
    mascot: treeMascot
  }
]

function SummerCampPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedLevel = searchParams.get('niveau')
  const activeLevel = levels.some((level) => level.id === requestedLevel)
    ? requestedLevel
    : null

  const selectLevel = (level) => {
    setSearchParams({ niveau: level })

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('summer-camp-level-panel')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      })
    })
  }

  return (
    <main className="summer-camp-page">
      <section className="summer-camp-hero">
        <div className="summer-camp-hero__identity">
          <div className="summer-camp-hero__content">
            <span className="summer-camp-kicker">Une parenthèse pour apprendre autrement</span>
            <h1>Summer Camp <strong>Salsabil</strong></h1>
            <div className="summer-camp-hero__introduction">
              <p>
                L’été est un temps précieux pour ralentir, retrouver confiance et
                entretenir le plaisir d’apprendre, loin du rythme habituel de l’année.
              </p>
              <p>
                Le Summer Camp Salsabil offre aux enfants un cadre chaleureux et
                stimulant, où les apprentissages se poursuivent avec douceur, curiosité
                et bienveillance.
              </p>
            </div>
          </div>
        </div>

        <div className="summer-camp-level-cards" role="tablist" aria-label="Choisir le niveau du Summer Camp">
          {levels.map((level) => {
            const isActive = activeLevel === level.id

            return (
              <button
                className={`summer-camp-level-card summer-camp-level-card--${level.id}${isActive ? ' summer-camp-level-card--active' : ''}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="summer-camp-level-panel"
                key={level.id}
                onClick={() => selectLevel(level.id)}
              >
                <img
                  className="summer-camp-level-card__background"
                  src={level.image}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                />
                <span className="summer-camp-level-card__copy">
                  <small>Summer Camp</small>
                  <strong>{level.title}</strong>
                  <span>{level.subtitle}</span>
                  {level.mascot && (
                    <img
                      className="summer-camp-level-card__mascot"
                      src={level.mascot}
                      alt=""
                      aria-hidden="true"
                      decoding="async"
                      loading="eager"
                      fetchPriority="auto"
                    />
                  )}
                </span>
                <span className="summer-camp-level-card__action">
                  Découvrir
                  <i aria-hidden="true"></i>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {activeLevel && (
        <section className="summer-camp-levels" aria-live="polite">
          <div
            className="summer-camp-level-panel"
            id="summer-camp-level-panel"
            role="tabpanel"
          >
            {activeLevel === 'primaire'
              ? <SummerCampPrimaryOffer />
              : <SummerCampCollegeOffer />}
          </div>
        </section>
      )}
    </main>
  )
}

export default SummerCampPage
