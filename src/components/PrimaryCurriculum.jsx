import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EnrollmentModal from './EnrollmentModal'
import FormulaGradeSelector from './FormulaGradeSelector'
import { addCartItem } from '../utils/cart'
import { formatEuro } from '../utils/pricing'
import {
  getCurriculumPricing,
  getOfferId,
  getOptionPrice,
  getPricingPlans
} from '../data/offerCatalog'
import './PrimaryCurriculum.css'

// Le contenu des programmes reste ici ; les prix et suppléments sont centralisés.
const grades = [
  {
    id: 'cp',
    label: 'CP',
    cycle: 'Cycle 2 - premiers apprentissages',
    summary:
      "Le CP installe les bases de la lecture, de l'écriture et du calcul. Les apprentissages sont explicites, progressifs et repris quotidiennement afin que chaque enfant avance avec assurance.",
    weeklyHours: '19 h',
    subjects: [
      {
        name: 'Français',
        hours: '10 h',
        content:
          "Décodage, correspondances entre lettres et sons, lecture à voix haute, compréhension de phrases et de récits courts, copie, écriture cursive, premiers textes, vocabulaire, orthographe et étude progressive de la langue."
      },
      {
        name: 'Mathématiques',
        hours: '5 h',
        content:
          "Construction du nombre, numération jusqu'à 100 puis au-delà, additions et soustractions, calcul mental quotidien, résolution de problèmes simples, repérage, formes géométriques, longueurs et monnaie."
      },
      {
        name: 'Anglais',
        hours: '1 h 30',
        content:
          "Écoute et répétition, salutations, consignes de classe, nombres, couleurs, famille et environnement proche à travers des chansons, jeux et échanges oraux très courts."
      },
      {
        name: 'Questionner le monde',
        hours: '2 h 30 avec EMC',
        content:
          "Repères dans le temps et l'espace, observation du vivant, de la matière et des objets, hygiène, saisons, environnement proche et premières règles de la vie collective."
      }
    ]
  },
  {
    id: 'ce1',
    label: 'CE1',
    cycle: 'Cycle 2 - automatisation',
    summary:
      "Le CE1 rend les acquis du CP plus sûrs et plus rapides. L'élève gagne en fluidité de lecture, développe son expression écrite et apprend à choisir des stratégies de calcul adaptées.",
    weeklyHours: '19 h',
    subjects: [
      {
        name: 'Français',
        hours: '10 h',
        content:
          "Lecture plus fluide et expressive, compréhension de textes variés, production de paragraphes courts, enrichissement lexical, accords simples, conjugaison au présent, futur et imparfait, dictées et relecture guidée."
      },
      {
        name: 'Mathématiques',
        hours: '5 h',
        content:
          "Numération jusqu'à 1 000, maîtrise progressive des quatre opérations, tables de multiplication, calcul mental, problèmes à plusieurs étapes simples, mesures, monnaie, temps et géométrie plane."
      },
      {
        name: 'Anglais',
        hours: '1 h 30',
        content:
          "Comprendre des questions familières, se présenter, parler de ses goûts et habitudes, mémoriser des formulations courantes et découvrir des fêtes et repères culturels anglophones."
      },
      {
        name: 'Questionner le monde',
        hours: '2 h 30 avec EMC',
        content:
          "Cycles de vie, besoins des êtres vivants, états de la matière, objets techniques, évolution des modes de vie, lecture de plans simples et compréhension des règles communes."
      }
    ]
  },
  {
    id: 'ce2',
    label: 'CE2',
    cycle: 'Cycle 2 - maîtrise des fondamentaux',
    summary:
      "Le CE2 achève le cycle des apprentissages fondamentaux. L'enfant apprend à lire pour comprendre et apprendre, à rédiger avec davantage d'autonomie et à expliquer ses démarches.",
    weeklyHours: '19 h',
    subjects: [
      {
        name: 'Français',
        hours: '10 h',
        content:
          "Compréhension de textes plus longs, lecture d'œuvres adaptées, rédaction organisée, vocabulaire précis, classes de mots, accords dans le groupe nominal, conjugaison des temps usuels et consolidation orthographique."
      },
      {
        name: 'Mathématiques',
        hours: '5 h',
        content:
          "Nombres jusqu'à 10 000, calcul posé et mental, multiplication et division, fractions simples, résolution de problèmes, mesures et conversions, angles droits, symétrie et solides."
      },
      {
        name: 'Anglais',
        hours: '1 h 30',
        content:
          "Dialogues courts, compréhension d'instructions et de récits simples, description de personnes et de lieux, premiers écrits très guidés et consolidation du vocabulaire quotidien."
      },
      {
        name: 'Questionner le monde',
        hours: '2 h 30 avec EMC',
        content:
          "Relations entre les êtres vivants, propriétés de la matière, fonctionnement d'objets, grandes périodes du temps, paysages, cartes, territoires et responsabilité dans la vie collective."
      }
    ]
  },
  {
    id: 'cm1',
    label: 'CM1',
    cycle: 'Cycle 3 - consolidation',
    summary:
      "Le CM1 ouvre le cycle de consolidation. Les savoirs fondamentaux sont mobilisés dans toutes les disciplines et l'élève apprend à rechercher, argumenter, expérimenter et organiser son travail.",
    weeklyHours: '19 h',
    subjects: [
      {
        name: 'Français',
        hours: '8 h',
        content:
          "Lecture d'œuvres intégrales, compréhension explicite et implicite, exposés, rédaction de textes structurés, vocabulaire, grammaire de la phrase, conjugaison, orthographe grammaticale et révision autonome."
      },
      {
        name: 'Mathématiques',
        hours: '5 h',
        content:
          "Grands nombres, fractions et nombres décimaux, quatre opérations, calcul mental, proportionnalité simple, problèmes complexes, périmètres, aires, angles, figures et solides."
      },
      {
        name: 'Anglais',
        hours: '1 h 30',
        content:
          "Comprendre et produire des phrases liées, participer à des échanges préparés, lire et écrire de courts textes, enrichir le vocabulaire et découvrir plusieurs espaces culturels anglophones."
      },
      {
        name: 'Histoire-géographie',
        hours: '2 h 30 avec EMC',
        content:
          "Des premières traces d'occupation à la Révolution et à l'Empire ; découverte des territoires français, des lieux de vie, des activités et des déplacements à différentes échelles."
      },
      {
        name: 'Sciences et technologie',
        hours: '2 h',
        content:
          "Matière, mouvement, énergie, vivant, corps humain, planète Terre, environnement, objets techniques, expérimentation, mesure et premières démarches de conception."
      }
    ]
  },
  {
    id: 'cm2',
    label: 'CM2',
    cycle: 'Cycle 3 - préparation au collège',
    summary:
      "Le CM2 consolide les méthodes et les connaissances nécessaires à l'entrée en sixième. L'élève développe son autonomie, apprend à justifier ses réponses et mène des travaux plus longs.",
    weeklyHours: '19 h',
    subjects: [
      {
        name: 'Français',
        hours: '8 h',
        content:
          "Lecture et interprétation de textes littéraires et documentaires, expression orale construite, écrits longs, argumentation simple, maîtrise de la phrase complexe, conjugaison et orthographe."
      },
      {
        name: 'Mathématiques',
        hours: '5 h',
        content:
          "Nombres entiers et décimaux, fractions, calculs complexes, proportionnalité et pourcentages simples, résolution de problèmes, conversions, aires, volumes, propriétés géométriques et données."
      },
      {
        name: 'Anglais',
        hours: '1 h 30',
        content:
          "Échanges plus autonomes, compréhension de documents courts, présentation d'un sujet familier, production écrite guidée et consolidation du niveau A1 attendu au cycle 3."
      },
      {
        name: 'Histoire-géographie',
        hours: '2 h 30 avec EMC',
        content:
          "République, âge industriel, guerres mondiales et construction européenne ; communication, déplacements, consommation, développement durable et place de la France dans le monde."
      },
      {
        name: 'Sciences et technologie',
        hours: '2 h',
        content:
          "Classification et évolution du vivant, fonctions du corps, ressources, climat, électricité, signaux, matériaux, fonctionnement et programmation simple d'objets techniques."
      }
    ]
  }
]

function buildPrimaryEnrollmentFields(planId) {
  // Le supplément arabe dépend du rythme de paiement sélectionné.
  const surcharge = getOptionPrice('primary', 'arabicLanguage', planId)

  return [
    {
    name: 'timeSlot',
    label: 'Tranche horaire',
    placeholder: 'Choisir une tranche horaire',
    required: true,
    options: [
      { value: 'morning', label: 'Matin' },
      { value: 'afternoon', label: 'Après-midi' }
    ]
    },
    {
      name: 'arabicLanguage',
      label: 'Langue arabe (option payante)',
      placeholder: 'Choisir une option',
      defaultValue: 'none',
      options: [
        { value: 'none', label: 'Sans langue arabe' },
        { value: 'arabic', label: `Ajouter la langue arabe (+ ${formatEuro(surcharge)})` }
      ]
    }
  ]
}

function PrimaryCurriculum() {
  const [activeGrade, setActiveGrade] = useState(grades[0].id)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const navigate = useNavigate()
  const grade = grades.find((item) => item.id === activeGrade) ?? grades[0]
  const pricingPlans = getPricingPlans('primary', grade.id)
  const enrollmentFields = selectedPlan
    ? buildPrimaryEnrollmentFields(selectedPlan.id)
    : []

  return (
    <div className="primary-curriculum">
      <section className="primary-curriculum-program" aria-labelledby="primary-curriculum-title">
        <header className="primary-curriculum-heading">
          <div>
            <span>Le cursus académique français</span>
            <h2 id="primary-curriculum-title">Un parcours progressif du CP au CM2</h2>
          </div>
          <p>
            Chaque année consolide les acquis précédents. Les fondamentaux sont
            travaillés quotidiennement, avec des activités adaptées à l'âge et un suivi
            régulier des progrès.
          </p>
        </header>

        <div className="primary-grade-tabs" role="tablist" aria-label="Choisir une classe du primaire">
          {grades.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              aria-selected={activeGrade === item.id}
              className={activeGrade === item.id ? 'primary-grade-tab primary-grade-tab--active' : 'primary-grade-tab'}
              onClick={() => setActiveGrade(item.id)}
            >
              <strong>{item.label}</strong>
              <span>{item.cycle}</span>
            </button>
          ))}
        </div>

        <article className="primary-grade-panel">
          <header>
            <div>
              <span>Classe de {grade.label}</span>
              <h3>{grade.cycle}</h3>
            </div>
            <p>{grade.summary}</p>
          </header>

          <div className="primary-subjects">
            {grade.subjects.map((subject) => (
              <section className="primary-subject" key={subject.name}>
                <div>
                  <h4>{subject.name}</h4>
                  <span>{subject.hours}</span>
                </div>
                <p>{subject.content}</p>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className="primary-formulas" aria-labelledby="primary-formulas-title">
        <header className="primary-formulas-heading">
          <div>
            <span>Formules d’inscription</span>
            <h2 id="primary-formulas-title">Les formules pour la classe de {grade.label}</h2>
          </div>
          <p>
            Les trois formules donnent accès au même programme pédagogique. Seuls le
            calendrier de paiement, les frais de dossier et le niveau de dégressivité
            varient.
          </p>
        </header>

        <FormulaGradeSelector
          grades={grades}
          activeGrade={activeGrade}
          onChange={setActiveGrade}
          ariaLabel="Choisir la classe pour les formules du primaire"
        />

        <div className="primary-formulas-grid">
          {pricingPlans.map((plan) => (
            <article
              className={`primary-formula-card${plan.featured ? ' primary-formula-card--featured' : ''}`}
              key={plan.name}
            >
              {plan.badge && <span className="primary-formula-badge">{plan.badge}</span>}
              <span className="primary-formula-eyebrow">{plan.eyebrow}</span>
              <h3>{plan.name}</h3>
              <div className="primary-formula-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>
              <p>{plan.description}</p>
              <ul>
                {plan.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <button type="button" onClick={() => setSelectedPlan(plan)}>
                Choisir cette formule
              </button>
            </article>
          ))}
        </div>

        <p className="primary-formulas-note">
          Tarifs indicatifs hors taxes. Toute taxe éventuellement applicable sera
          précisée sur le devis. L’acompte confirme l’inscription et reste déduit du
          prix total de la formule.
        </p>
      </section>

      <section className="primary-organization" aria-labelledby="primary-organization-title">
        <header>
          <span>Organisation pédagogique</span>
          <h2 id="primary-organization-title">Des bases solides dans un cadre rassurant</h2>
          <p>
            Les volumes présentés couvrent le français, les mathématiques, l'anglais,
            la découverte du monde, les sciences et l'histoire-géographie. Les arts et
            l'EPS complètent la semaine nationale de 24 heures.
          </p>
        </header>

        <div className="primary-organization-grid">
          <div className="primary-hours-table">
            <div className="primary-hours-row primary-hours-row--heading">
              <span>Niveau</span>
              <span>Volume académique</span>
              <span>Tarif mensuel</span>
            </div>
            {grades.map((item) => (
              <div className="primary-hours-row" key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.weeklyHours}</span>
                <span>{formatEuro(getCurriculumPricing('primary', item.id).pricing.monthly)} / mois</span>
              </div>
            ))}
          </div>

          <aside className="primary-enrollment">
            <span className="primary-enrollment-number">10</span>
            <h3>élèves maximum par classe</h3>
            <p>
              Un petit groupe permet de faire lire, écrire, calculer et s'exprimer
              chaque enfant régulièrement, tout en respectant son rythme.
            </p>
            <ul>
              <li>Évaluation initiale des acquis</li>
              <li>Lecture et calcul mental quotidiens</li>
              <li>Corrections et bilans réguliers</li>
              <li>Échanges suivis avec les familles</li>
            </ul>
          </aside>
        </div>

        <div className="primary-pricing-note">
          <div>
            <span>Tarifs indicatifs sur 10 mensualités</span>
            <h3>Préparons ensemble son année scolaire</h3>
            <p>
              Le tarif final dépend de la formule choisie et des besoins particuliers
              identifiés lors de l'entretien pédagogique avec la famille.
            </p>
          </div>
          <button type="button" onClick={() => navigate('/contact')}>
            Demander un entretien
          </button>
        </div>

        <p className="primary-program-sources">
          Références : programmes et horaires publiés par le ministère de l'Éducation
          nationale et Éduscol, adaptés à notre présentation pédagogique.
        </p>
      </section>

      <EnrollmentModal
        key={selectedPlan?.id ?? 'closed-primary-enrollment-modal'}
        isOpen={Boolean(selectedPlan)}
        title={`Inscription ${grade.label}`}
        subtitle="Cursus Primaire"
        fields={enrollmentFields}
        summary={(options) => {
          const optionPrice = options.arabicLanguage === 'arabic'
            ? getOptionPrice('primary', 'arabicLanguage', selectedPlan.id)
            : 0

          return {
            label: `Formule ${selectedPlan.name}${optionPrice ? ' + langue arabe' : ''}`,
            value: `${formatEuro(selectedPlan.amount + optionPrice)} ${selectedPlan.period}`
          }
        }}
        onClose={() => setSelectedPlan(null)}
        onSubmit={(options) => {
          // Le total n'est pas stocké : il sera recalculé par le catalogue dans le panier.
          addCartItem({
            offerId: getOfferId('primary', grade.id, selectedPlan.id),
            selections: options
          })
        }}
      />
    </div>
  )
}

export default PrimaryCurriculum
