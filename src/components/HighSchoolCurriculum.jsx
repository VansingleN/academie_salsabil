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
import { withBillingCountryField } from '../data/countries'
import './HighSchoolCurriculum.css'

// Les contenus académiques restent locaux ; la tarification est lue dans offerCatalog.
const grades = [
  {
    id: 'seconde',
    label: 'Seconde',
    cycle: 'Consolidation et orientation',
    summary:
      "La seconde consolide la culture commune du collège et prépare le choix de la voie et des spécialités. L'élève gagne en autonomie, apprend à argumenter et découvre des méthodes plus exigeantes.",
    weeklyHours: '24 h 30',
    subjects: [
      {
        name: 'Français',
        hours: '4 h',
        content:
          "Poésie, littérature d'idées et presse, roman, récit et théâtre ; lecture analytique, dissertation guidée, commentaire, expression orale, maîtrise de la langue et construction d'une culture littéraire."
      },
      {
        name: 'Anglais',
        hours: 'LVA/LVB : 5 h 30',
        content:
          "Compréhension de documents authentiques, interaction, prise de parole continue, expression écrite structurée et étude des cultures anglophones selon les axes du programme."
      },
      {
        name: 'Histoire-géographie',
        hours: '3 h',
        content:
          "Grandes étapes de la formation du monde moderne, sociétés et pouvoirs ; environnement, développement, mobilités et transitions territoriales, avec analyse régulière de cartes et documents."
      },
      {
        name: 'Mathématiques',
        hours: '4 h',
        content:
          "Nombres et calculs, fonctions, géométrie repérée, vecteurs, statistiques, probabilités, algorithmique et programmation, avec un travail renforcé sur la démonstration et la modélisation."
      },
      {
        name: 'Physique-chimie',
        hours: '3 h',
        content:
          "Constitution et transformations de la matière, mouvement et interactions, énergie, ondes et signaux, mesures expérimentales, exploitation de données et construction de modèles."
      },
      {
        name: 'SVT',
        hours: '1 h 30',
        content:
          "Organisation du vivant, biodiversité et évolution, enjeux environnementaux, géosciences, procréation, santé et fonctionnement du corps humain."
      },
      {
        name: 'Sciences numériques et technologie',
        hours: '1 h 30',
        content:
          "Internet, Web, réseaux sociaux, données, géolocalisation, objets connectés, photographie numérique et initiation à la programmation et aux enjeux citoyens du numérique."
      },
      {
        name: 'Sciences économiques et sociales',
        hours: '1 h 30',
        content:
          "Premiers raisonnements économiques, sociologiques et politiques : production, marchés, socialisation, diplômes, emploi et organisation de la vie collective."
      }
    ]
  },
  {
    id: 'premiere',
    label: 'Première',
    cycle: 'Spécialisation et épreuves anticipées',
    summary:
      "En première générale, l'élève conserve un tronc commun et choisit trois spécialités de quatre heures. Notre accompagnement associe préparation du bac de français, suivi du contrôle continu et consolidation du projet d'orientation.",
    weeklyHours: '25 h 30',
    subjects: [
      {
        name: 'Français',
        hours: '4 h',
        content:
          "Étude des œuvres nationales au programme, poésie, littérature d'idées, roman et théâtre ; commentaire, dissertation, contraction ou essai selon la voie, lecture expressive et préparation complète aux épreuves écrite et orale."
      },
      {
        name: 'Anglais',
        hours: 'LVA/LVB : 4 h 30',
        content:
          "Argumentation, compréhension fine de supports variés, débats, présentations, écrits développés et approfondissement des enjeux historiques, culturels et contemporains du monde anglophone."
      },
      {
        name: 'Histoire-géographie',
        hours: '3 h',
        content:
          "Europe des révolutions, industrialisation, construction de la République et Première Guerre mondiale ; métropolisation, espaces productifs, ruralités et recomposition des territoires."
      },
      {
        name: 'Enseignement scientifique',
        hours: '2 h ou 3 h 30',
        content:
          "Matière, Soleil, Terre, son, musique, biodiversité et science du climat. Un module de mathématiques de 1 h 30 complète cet enseignement pour les élèves sans spécialité mathématiques."
      },
      {
        name: 'Spécialité mathématiques',
        hours: '4 h',
        content:
          "Algèbre, suites, dérivation, fonctions, géométrie, probabilités, statistiques, algorithmique et programmation, avec une place importante donnée au raisonnement et à la démonstration."
      },
      {
        name: 'Spécialité physique-chimie',
        hours: '4 h',
        content:
          "Suivi de transformations, structure de la matière, interactions, mécanique, énergie, ondes, optique et pratique expérimentale fondée sur la modélisation."
      },
      {
        name: 'Spécialité SVT',
        hours: '4 h',
        content:
          "Transmission et expression du patrimoine génétique, dynamique interne de la Terre, écosystèmes, immunité, santé et enjeux contemporains de la planète."
      },
      {
        name: 'Méthode et orientation',
        hours: 'Suivi intégré',
        content:
          "Organisation du travail personnel, préparation des évaluations, choix des deux spécialités conservées en terminale et première réflexion sur les formations supérieures."
      }
    ]
  },
  {
    id: 'terminale',
    label: 'Terminale',
    cycle: 'Baccalauréat et études supérieures',
    summary:
      "La terminale est consacrée à la maîtrise des deux spécialités conservées, aux épreuves finales, au Grand oral et à l'orientation post-bac. Le suivi aide l'élève à tenir un rythme exigeant sans perdre de vue son projet.",
    weeklyHours: '25 h',
    subjects: [
      {
        name: 'Philosophie',
        hours: '4 h',
        content:
          "Étude des notions et auteurs du programme, problématisation, construction d'une argumentation, explication de texte et entraînement progressif à la dissertation."
      },
      {
        name: 'Anglais',
        hours: 'LVA/LVB : 4 h',
        content:
          "Compréhension de documents complexes, expression nuancée, synthèse, argumentation orale et écrite et consolidation du niveau nécessaire aux études supérieures."
      },
      {
        name: 'Histoire-géographie',
        hours: '3 h',
        content:
          "Relations internationales depuis 1929, puissances, démocratie et construction européenne ; mers, océans, territoires, patrimoine et place de la France dans le monde."
      },
      {
        name: 'Enseignement scientifique',
        hours: '2 h',
        content:
          "Science, climat et société, énergie, histoire du vivant, intelligence artificielle et regard critique sur les modèles, les données et les enjeux scientifiques contemporains."
      },
      {
        name: 'Spécialité mathématiques',
        hours: '6 h',
        content:
          "Analyse, limites, continuité, dérivation, intégration, suites, géométrie dans l'espace, probabilités, combinatoire et algorithmique, avec préparation soutenue aux épreuves."
      },
      {
        name: 'Spécialité physique-chimie',
        hours: '6 h',
        content:
          "Transformations chimiques, cinétique, mécanique, thermodynamique, électricité, ondes, optique et stratégies expérimentales, avec résolution de problèmes complexes."
      },
      {
        name: 'Spécialité SVT',
        hours: '6 h',
        content:
          "Génétique et évolution, géologie, plantes, climat, système nerveux, mouvement, stress et santé, avec analyse de données et construction d'argumentations scientifiques."
      },
      {
        name: 'Grand oral et Parcoursup',
        hours: 'Suivi intégré',
        content:
          "Choix des questions, recherche, structuration du propos, prise de parole, entretien avec le jury, constitution du dossier Parcoursup et préparation à l'entrée dans le supérieur."
      }
    ]
  }
]

const highSchoolTimeSlotField = {
  name: 'timeSlot',
  label: 'Tranche horaire',
  placeholder: 'Choisir une tranche horaire',
  required: true,
  options: [
    { value: 'morning', label: 'Matin' },
    { value: 'afternoon', label: 'Après-midi' }
  ]
}

/*
const highSchoolTrackField = {
  name: 'track',
  label: 'Filière',
  placeholder: 'Choisir une filière',
  required: true,
  options: [
    { value: 'general', label: 'Voie générale' },
    { value: 'stmg', label: 'STMG - Management et gestion' },
    { value: 'sti2d', label: 'STI2D - Industrie et développement durable' },
    { value: 'st2s', label: 'ST2S - Santé et social' },
    { value: 'professional', label: 'Voie professionnelle' }
  ]
}
*/

const highSchoolLanguageOptions = [
  { value: 'spanish', label: 'Espagnol' },
  { value: 'arabic', label: 'Arabe' }
]

function buildHighSchoolEnrollmentFields(planId) {
  // Le supplément LV3 suit automatiquement la formule mensuelle, trimestrielle ou annuelle.
  const surcharge = getOptionPrice('highSchool', 'lv3', planId)

  return withBillingCountryField([
    highSchoolTimeSlotField,
    // Décommentez la ligne suivante pour activer le choix de la filière.
    // highSchoolTrackField,
    {
      name: 'lv2',
      label: 'LV2',
      placeholder: 'Choisir la LV2',
      required: true,
      options: highSchoolLanguageOptions.map((option) => ({
        ...option,
        disabled: (values) => values.lv3 === option.value
      }))
    },
    {
      name: 'lv3',
      label: 'LV3 (option payante)',
      placeholder: 'Choisir la LV3',
      defaultValue: 'none',
      options: [
        { value: 'none', label: 'Aucune LV3' },
        {
          value: 'spanish',
          label: `Espagnol (+ ${formatEuro(surcharge)})`,
          disabled: (values) => values.lv2 === 'spanish'
        },
        {
          value: 'arabic',
          label: `Arabe (+ ${formatEuro(surcharge)})`,
          disabled: (values) => values.lv2 === 'arabic'
        }
      ]
    }
  ])
}

function HighSchoolCurriculum() {
  const [activeGrade, setActiveGrade] = useState(grades[0].id)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const navigate = useNavigate()
  const grade = grades.find((item) => item.id === activeGrade) ?? grades[0]
  const pricingPlans = getPricingPlans('highSchool', grade.id)
  const enrollmentFields = selectedPlan
    ? buildHighSchoolEnrollmentFields(selectedPlan.id)
    : []

  return (
    <div className="high-school-curriculum">
      <section className="high-school-program" aria-labelledby="high-school-title">
        <header className="high-school-heading">
          <div>
            <span>Le cursus du lycée général</span>
            <h2 id="high-school-title">De la seconde au baccalauréat</h2>
          </div>
          <p>
            Un parcours exigeant qui associe culture commune, spécialités scientifiques,
            préparation aux examens et accompagnement vers les études supérieures.
          </p>
        </header>

        <div className="high-school-tabs" role="tablist" aria-label="Choisir une classe du lycée">
          {grades.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              aria-selected={activeGrade === item.id}
              className={activeGrade === item.id ? 'high-school-tab high-school-tab--active' : 'high-school-tab'}
              onClick={() => setActiveGrade(item.id)}
            >
              <strong>{item.label}</strong>
              <span>{item.cycle}</span>
            </button>
          ))}
        </div>

        <article className="high-school-panel">
          <header>
            <div>
              <span>Classe de {grade.label}</span>
              <h3>{grade.cycle}</h3>
            </div>
            <p>{grade.summary}</p>
          </header>

          <div className="high-school-subjects">
            {grade.subjects.map((subject) => (
              <section className="high-school-subject" key={subject.name}>
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

      <section className="high-school-formulas" aria-labelledby="high-school-formulas-title">
        <header className="high-school-formulas-heading">
          <div>
            <span>Formules d’inscription</span>
            <h2 id="high-school-formulas-title">Les formules pour la classe de {grade.label}</h2>
          </div>
          <p>
            Toutes les formules donnent accès au même programme pédagogique. Le
            tarif et sa dégressivité s’actualisent selon la classe choisie ci-dessus.
          </p>
        </header>

        <FormulaGradeSelector
          grades={grades}
          activeGrade={activeGrade}
          onChange={setActiveGrade}
          ariaLabel="Choisir la classe pour les formules du lycée"
        />

        <div className="high-school-formulas-grid">
          {pricingPlans.map((plan) => (
            <article
              className={`high-school-formula-card${plan.featured ? ' high-school-formula-card--featured' : ''}${!plan.available ? ' formula-card--unavailable' : ''}`}
              key={plan.name}
            >
              {plan.badge && <span className="high-school-formula-badge">{plan.badge}</span>}
              <span className="high-school-formula-eyebrow">{plan.eyebrow}</span>
              <h3>{plan.name}</h3>
              <div className="high-school-formula-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>
              <p>{plan.description}</p>
              <ul>
                {plan.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              {!plan.available && <span className="formula-card-status">{plan.unavailableReason}</span>}
              <button
                type="button"
                disabled={!plan.available}
                onClick={() => setSelectedPlan(plan)}
              >
                {plan.available ? 'Choisir cette formule' : 'Inscriptions closes'}
              </button>
            </article>
          ))}
        </div>

        <p className="high-school-formulas-note">
          Tarifs indicatifs hors taxes. Toute taxe éventuellement applicable sera
          précisée avant l’ajout au panier. Le premier paiement et les frais de
          dossier sont encaissés à l’inscription.
        </p>
      </section>

      <section className="high-school-organization" aria-labelledby="high-school-organization-title">
        <header>
          <span>Organisation pédagogique</span>
          <h2 id="high-school-organization-title">Un suivi soutenu jusqu’au post-bac</h2>
          <p>
            Les volumes de première et terminale correspondent à un parcours général
            avec trois puis deux spécialités. Ils peuvent varier selon les spécialités,
            les options et le module de mathématiques suivi.
          </p>
        </header>

        <div className="high-school-organization-grid">
          <div className="high-school-hours-table">
            <div className="high-school-hours-row high-school-hours-row--heading">
              <span>Niveau</span>
              <span>Volume de référence</span>
              <span>Tarif mensuel</span>
            </div>
            {grades.map((item) => (
              <div className="high-school-hours-row" key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.weeklyHours}</span>
                <span>{formatEuro(getCurriculumPricing('highSchool', item.id).pricing.monthly)} / mois</span>
              </div>
            ))}
          </div>

          <aside className="high-school-enrollment">
            <span className="high-school-enrollment-number">12</span>
            <h3>élèves maximum par classe</h3>
            <p>
              Cet effectif permet de corriger les productions en profondeur, de faire
              participer chaque élève et d'ajuster rapidement les méthodes de travail.
            </p>
            <ul>
              <li>Bilans et objectifs individualisés</li>
              <li>Devoirs type bac régulièrement corrigés</li>
              <li>Préparation à l’oral et aux examens</li>
              <li>Accompagnement à l’orientation et Parcoursup</li>
            </ul>
          </aside>
        </div>

        <div className="high-school-pricing-note">
          <div>
            <span>Tarifs indicatifs sur 10 mensualités</span>
            <h3>Définissons le parcours et les spécialités à accompagner</h3>
            <p>
              Le tarif définitif dépend des spécialités retenues, des options et du
              niveau d'accompagnement individuel nécessaire à l'élève.
            </p>
          </div>
          <button type="button" onClick={() => navigate('/contact')}>
            Demander un entretien
          </button>
        </div>

        <p className="high-school-sources">
          Références : horaires et programmes du lycée général publiés par le ministère
          de l'Éducation nationale et Éduscol, adaptés à notre présentation pédagogique.
        </p>
      </section>

      <EnrollmentModal
        key={selectedPlan?.id ?? 'closed-high-school-enrollment-modal'}
        isOpen={Boolean(selectedPlan)}
        title={`Inscription ${grade.label}`}
        subtitle="Cursus Lycée"
        offerId={selectedPlan
          ? getOfferId('highSchool', grade.id, selectedPlan.id)
          : null}
        fields={enrollmentFields}
        summary={(options) => {
          const optionPrice = options.lv3 && options.lv3 !== 'none'
            ? getOptionPrice('highSchool', 'lv3', selectedPlan.id)
            : 0

          return {
            label: `Formule ${selectedPlan.name}${optionPrice ? ' + LV3' : ''}`,
            value: `${formatEuro(selectedPlan.amount + optionPrice)} ${selectedPlan.period}`
          }
        }}
        onClose={() => setSelectedPlan(null)}
        onSubmit={(options) => {
          // Aucun prix issu de la modale n'est enregistré dans localStorage.
          addCartItem({
            offerId: getOfferId('highSchool', grade.id, selectedPlan.id),
            selections: options
          })
        }}
      />
    </div>
  )
}

export default HighSchoolCurriculum
