import { useRef } from 'react'
import { Link } from 'react-router-dom'
import englishImage from '../images/card_anglais.webp'
import frenchImage from '../images/card_francais.webp'
import historyGeographyImage from '../images/card_histoiregeo.webp'
import mathematicsImage from '../images/card_maths.webp'
import physicsChemistryImage from '../images/card_physiquechimie.webp'
import biologyImage from '../images/card_svt.webp'
import technologyImage from '../images/card_techno.webp'
import {
  formatSchoolSupportPrice,
  schoolSupportPricing
} from '../data/schoolSupportPricing'
import './SchoolSupport.css'

const supportPrograms = [
  {
    number: '01',
    title: 'Accompagnement global',
    description:
      "Un accompagnement transversal pour consolider l'ensemble du parcours scolaire et maintenir une progression régulière dans toutes les matières.",
    subjects: ['Toutes les matières du niveau', 'Méthodologie', 'Organisation', 'Préparation aux évaluations']
  },
  {
    number: '02',
    title: 'Pôle scientifique',
    description:
      'Un programme ciblé pour développer le raisonnement, reprendre les notions complexes et renforcer la maîtrise des disciplines scientifiques.',
    subjects: ['Mathématiques', 'Sciences physiques', 'SVT', 'Technologie']
  },
  {
    number: '03',
    title: 'Pôle littéraire',
    description:
      "Un suivi consacré à la compréhension, à l'expression et à la construction de repères solides dans les disciplines littéraires.",
    subjects: ['Français', 'Anglais', 'Histoire-géographie']
  }
]

const supportedSubjects = [
  {
    name: 'Français',
    type: 'french',
    description: 'Lecture, expression, grammaire et rédaction',
    image: frenchImage
  },
  {
    name: 'Mathématiques',
    type: 'math',
    description: 'Calcul, raisonnement et résolution de problèmes',
    image: mathematicsImage
  },
  {
    name: 'Histoire-géographie',
    type: 'history',
    description: 'Repères, territoires et analyse de documents',
    image: historyGeographyImage
  },
  {
    name: 'Anglais',
    type: 'english',
    description: 'Compréhension, vocabulaire et expression',
    image: englishImage
  },
  {
    name: 'SVT',
    type: 'biology',
    description: 'Vivant, planète, environnement et santé',
    image: biologyImage
  },
  {
    name: 'Physique-chimie',
    type: 'physics',
    description: 'Matière, énergie, mouvements et expériences',
    image: physicsChemistryImage
  },
  {
    name: 'Technologie',
    type: 'technology',
    description: 'Conception, systèmes et programmation',
    image: technologyImage
  }
]

function SubjectCard({ subject }) {
  return (
    <article
      className={`school-subject-card school-subject-card--${subject.type}${subject.image ? ' school-subject-card--image' : ''}`}
      style={subject.image ? { '--subject-card-image': `url(${subject.image})` } : undefined}
    >
      <div className="school-subject-card__content">
        <h4>{subject.name}</h4>
        <p>{subject.description}</p>
      </div>
    </article>
  )
}

function SchoolSupport({ compact = false }) {
  const subjectsViewportRef = useRef(null)

  const scrollSubjects = (direction) => {
    const viewport = subjectsViewportRef.current
    if (!viewport) return

    const card = viewport.querySelector('.school-subject-card')
    const gap = 16
    const distance = (card?.getBoundingClientRect().width ?? 260) + gap

    viewport.scrollBy({
      left: direction * distance,
      behavior: 'smooth'
    })
  }

  if (compact) {
    return (
      <section className="school-support school-support--compact" aria-labelledby="school-support-title">
        <div className="school-support-container">
          <header className="school-support-heading">
            <div>
              <span className="school-support-kicker">Soutien scolaire</span>
              <h2 id="school-support-title">Un accompagnement ciblé, au bon rythme</h2>
            </div>
            <p>
              Pour consolider les acquis dans la durée ou répondre à une difficulté
              précise, nous construisons un suivi adapté aux besoins de l’élève.
            </p>
          </header>

          <div className="school-support-preview">
            <article>
              <span>Suivi dans la durée</span>
              <h3>Soutien régulier</h3>
              <p>
                Un rendez-vous stable pour reprendre les notions fragiles, progresser
                avec méthode et retrouver confiance.
              </p>
            </article>
            <article>
              <span>Objectif ciblé</span>
              <h3>Besoin ponctuel</h3>
              <p>
                Une aide concentrée sur une matière, un chapitre, des devoirs ou la
                préparation d’une évaluation.
              </p>
            </article>
          </div>

          <div className="school-support-preview__action">
            <Link to="/soutien-scolaire">Découvrir le soutien scolaire</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="school-support"
      id="support-needs"
      aria-labelledby="school-support-title"
    >
      <div className="school-support-container">
        <header className="school-support-heading">
          <div>
            <span className="school-support-kicker">Partir du besoin de l’élève</span>
            <h2 id="school-support-title">Quel accompagnement recherchez-vous ?</h2>
          </div>
          <p>
            Le soutien peut répondre à une difficulté précise ou s’inscrire dans la
            durée. Le rythme et les matières sont ensuite définis avec la famille.
          </p>
        </header>

        <div className="school-support-needs">
          <Link to="/demande-soutien?parcours=creneau&type=regulier">
            <span>Suivi dans la durée</span>
            <h3>Soutien régulier</h3>
            <p>
              Des séances planifiées pour consolider les acquis, reprendre les
              difficultés au fil de l’année et installer une méthode de travail durable.
            </p>
            <strong>Idéal pour progresser avec continuité</strong>
            <small>Demander un créneau →</small>
          </Link>
          <Link to="/demande-soutien?parcours=creneau&type=ponctuel">
            <span>Objectif ciblé</span>
            <h3>Besoin ponctuel</h3>
            <p>
              Une aide concentrée sur une matière, un chapitre, des devoirs, une
              remise à niveau ou la préparation d’une évaluation.
            </p>
            <strong>Idéal pour répondre à une priorité précise</strong>
            <small>Demander un créneau →</small>
          </Link>
        </div>

        <div className="school-support-guidance">
          <div>
            <strong>Vous hésitez entre les deux ?</strong>
            <p>
              Présentez-nous la situation de l’élève : nous vous aiderons à définir le
              format, les matières et le rythme les plus pertinents.
            </p>
          </div>
          <Link to="/demande-soutien?parcours=conseil">Être conseillé</Link>
        </div>

        <section className="school-subjects-carousel" aria-labelledby="school-subjects-title">
          <header>
            <span>Choisir les matières</span>
            <h3 id="school-subjects-title">Une ou plusieurs disciplines selon les objectifs</h3>
            <p>
              L’accompagnement peut se concentrer sur une matière ou associer plusieurs
              disciplines lorsque les besoins sont plus larges.
            </p>
          </header>

          <div className="school-subjects-slider">
            <div className="school-subjects-controls" aria-label="Navigation des matières">
              <button
                className="school-subjects-control school-subjects-control--previous"
                type="button"
                aria-label="Voir les matières précédentes"
                onClick={() => scrollSubjects(-1)}
              >
                <span aria-hidden="true"></span>
              </button>
              <button
                className="school-subjects-control school-subjects-control--next"
                type="button"
                aria-label="Voir les matières suivantes"
                onClick={() => scrollSubjects(1)}
              >
                <span aria-hidden="true"></span>
              </button>
            </div>

            <div className="school-subjects-viewport" ref={subjectsViewportRef}>
              {supportedSubjects.map((subject) => (
                <SubjectCard subject={subject} key={subject.name} />
              ))}
            </div>
          </div>
        </section>

        <section className="school-support-formats" aria-labelledby="school-support-formats-title">
          <header>
            <span>Quelques formats d’accompagnement</span>
            <h3 id="school-support-formats-title">
              Des exemples pour vous aider à vous projeter
            </h3>
            <p>
              Ces formats servent de repères : ils peuvent être ajustés selon le niveau,
              les matières prioritaires et le rythme recherché.
            </p>
          </header>

          <div className="school-support-programs">
            {supportPrograms.map((program) => (
              <article className="school-support-program" key={program.number}>
                <span className="school-support-number" aria-hidden="true">
                  {program.number}
                </span>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <ul>
                  {program.subjects.map((subject) => (
                    <li key={subject}>{subject}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="school-support-pricing" aria-labelledby="school-support-pricing-title">
          <header>
            <span>Des repères avant de nous contacter</span>
            <h3 id="school-support-pricing-title">Tarifs et modalités essentiels</h3>
            <p>
              Le tarif précis dépend du format et du besoin retenus. Il est toujours
              confirmé avec la famille avant le démarrage.
            </p>
          </header>

          <div className="school-support-pricing__grid">
            <article>
              <span>Individuel</span>
              <strong>
                Dès {formatSchoolSupportPrice(schoolSupportPricing.individual.amount)}
              </strong>
              <p>{schoolSupportPricing.individual.unit}</p>
            </article>
            <article>
              <span>Petit groupe</span>
              <strong>
                Dès {formatSchoolSupportPrice(schoolSupportPricing.group.amount)}
              </strong>
              <p>{schoolSupportPricing.group.unit}</p>
            </article>
            <article>
              <span>Durée habituelle</span>
              <strong>{schoolSupportPricing.standardSessionMinutes} min</strong>
              <p>
                {schoolSupportPricing.extendedSessionMinutes} min possibles selon
                l’objectif
              </p>
            </article>
            <article>
              <span>Engagement</span>
              <strong>Souple</strong>
              <p>Une séance ponctuelle ou un rythme régulier</p>
            </article>
          </div>

          <details>
            <summary>Consulter les principales conditions</summary>
            <p>
              Les créneaux sont proposés sous réserve de disponibilité. Le paiement
              intervient après validation de l’organisation et du tarif. Une séance
              peut être déplacée sans frais jusqu’à{' '}
              {schoolSupportPricing.rescheduleNoticeHours} h avant son début ; passé
              ce délai, elle peut rester due sauf situation exceptionnelle.
            </p>
          </details>
        </section>

        <section className="school-support-start" aria-labelledby="school-support-start-title">
          <header>
            <span>Un démarrage simple</span>
            <h3 id="school-support-start-title">Comment démarrer ?</h3>
          </header>

          <ol>
            <li>
              <span>01</span>
              <div>
                <h4>Vous présentez le besoin</h4>
                <p>Niveau, matières, difficultés rencontrées et objectif recherché.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h4>Nous précisons le cadre</h4>
                <p>Nous définissons avec vous les priorités et le rythme souhaité.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h4>Vous recevez une proposition</h4>
                <p>
                  Le créneau, l’organisation et le tarif sont validés avant le
                  règlement.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="school-support-custom" aria-labelledby="custom-support-title">
          <div className="school-support-custom-intro">
            <span>Votre besoin est unique</span>
            <h3 id="custom-support-title">Construire mon accompagnement</h3>
          </div>

          <div className="school-support-custom-copy">
            <p>
              Indiquez-nous le niveau de l’élève, les matières concernées, les
              difficultés rencontrées et le rythme souhaité.
            </p>
            <p>
              Après un premier échange, nous vous proposons une organisation claire,
              cohérente et adaptée à vos objectifs.
            </p>
          </div>

          <Link to="/demande-soutien?parcours=conseil">
            Être conseillé
          </Link>
        </section>
      </div>
    </section>
  )
}

export default SchoolSupport
