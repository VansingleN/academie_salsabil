import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PreschoolCurriculum.css'

const grades = [
  {
    id: 'ps',
    label: 'Petite section',
    shortLabel: 'Petite Section',
    age: '3 à 4 ans',
    focus: 'Entrer sereinement dans les apprentissages',
    summary:
      "La petite section accompagne les premiers pas dans la vie scolaire. L'enfant apprend à se séparer progressivement, à communiquer, à jouer avec les autres et à prendre confiance dans un cadre stable et rassurant.",
    weeklyHours: '24 h',
    price: '289 €',
    domains: [
      {
        name: 'Langage oral et écrit',
        frequency: 'Chaque jour',
        content:
          "Oser parler, nommer les personnes et les objets, comprendre une consigne simple, écouter une histoire, enrichir son vocabulaire et découvrir les livres, les traces et les premiers gestes graphiques."
      },
      {
        name: 'Premiers outils mathématiques',
        frequency: 'Chaque jour',
        content:
          "Comparer de petites quantités, réciter les premiers nombres, trier et classer, reconnaître des formes simples, reproduire une organisation et résoudre de premiers problèmes par la manipulation."
      },
      {
        name: 'Activités artistiques',
        frequency: 'Plusieurs fois par semaine',
        content:
          "Dessiner, peindre, modeler, coller, explorer les couleurs et les matières, chanter, écouter des sons, reproduire des rythmes et développer le plaisir de créer."
      },
      {
        name: 'Explorer le monde',
        frequency: 'Activités régulières',
        content:
          "Osbserver le vivant, manipuler l'eau et la matière, découvrir les objets usuels, les saisons et les premières règles d'hygiène et de sécurité."
      }
    ]
  },
  {
    id: 'ms',
    label: 'Moyenne section',
    shortLabel: 'Moyenne Section',
    age: '4 à 5 ans',
    focus: 'Développer le langage, la curiosité et l’autonomie',
    summary:
      "En moyenne section, l'enfant s'exprime avec davantage de précision, apprend à expliquer ce qu'il fait et développe sa capacité à observer, comparer, mémoriser et coopérer.",
    weeklyHours: '24 h',
    price: '309 €',
    domains: [
      {
        name: 'Langage oral et écrit',
        frequency: 'Chaque jour',
        content:
          "Construire des phrases plus complètes, raconter un événement, reformuler une histoire, catégoriser le vocabulaire, reconnaître son prénom et des lettres, jouer avec les syllabes et progresser dans le graphisme."
      },
      {
        name: 'Premiers outils mathématiques',
        frequency: 'Chaque jour',
        content:
          "Dénombrer des collections, associer nombre et quantité, comparer, décomposer de petits nombres, compléter une suite, reconnaître et reproduire des formes et résoudre des situations simples."
      },
      {
        name: 'Activité physique',
        frequency: 'Pratique quotidienne',
        content:
          "Enchaîner des actions, ajuster ses déplacements, lancer avec précision, danser, participer à des jeux collectifs et apprendre à respecter des règles et des rôles."
      },
      {
        name: 'Activités artistiques',
        frequency: 'Plusieurs fois par semaine',
        content:
          "Choisir des outils et des matériaux, composer une production, observer des œuvres, mémoriser un répertoire de chants, explorer le rythme et exprimer une intention par le geste."
      },
      {
        name: 'Explorer le monde',
        frequency: 'Activités régulières',
        content:
          "Ordonner les moments de la journée, utiliser un calendrier simple, observer les cycles du vivant, expérimenter avec la matière, construire et comprendre la fonction de quelques objets."
      }
    ]
  },
  {
    id: 'gs',
    label: 'Grande section',
    shortLabel: 'Grande Section',
    age: '5 à 6 ans',
    focus: 'Consolider les acquis et préparer l’entrée au CP',
    summary:
      "La grande section achève le cycle des apprentissages premiers. L'enfant structure son langage, consolide sa compréhension du nombre et développe les habitudes de travail qui faciliteront son entrée au CP.",
    weeklyHours: '24 h',
    price: '329 €',
    domains: [
      {
        name: 'Langage oral et écrit',
        frequency: 'Chaque jour',
        content:
          "S'exprimer de manière organisée, comprendre et raconter des récits, développer la conscience phonologique, connaître les lettres et leurs sons, écrire son prénom en cursive et produire de premiers messages dictés ou encodés."
      },
      {
        name: 'Premiers outils mathématiques',
        frequency: 'Chaque jour',
        content:
          "Comprendre les nombres jusqu'à 10 et au-delà, décomposer, comparer, anticiper un résultat, résoudre des problèmes simples, reconnaître des formes, utiliser des repères spatiaux et poursuivre des suites organisées."
      },
      {
        name: 'Activité physique',
        frequency: 'Pratique quotidienne',
        content:
          "Adapter ses actions à un objectif, réaliser des parcours, coopérer et s'opposer dans des jeux, coordonner ses gestes et présenter une courte production corporelle ou dansée."
      },
      {
        name: 'Activités artistiques',
        frequency: 'Plusieurs fois par semaine',
        content:
          "Mener un projet plastique, expérimenter des procédés, expliquer ses choix, rencontrer différentes formes d'art, chanter avec précision et reproduire ou inventer des organisations rythmiques."
      },
      {
        name: 'Explorer le monde',
        frequency: 'Activités régulières',
        content:
          "Se repérer dans la semaine et l'année, représenter un espace, connaître les besoins du vivant et le corps, expérimenter, utiliser des outils simples et adopter des comportements responsables."
      }
    ]
  }
]

function PreschoolCurriculum() {
  const [activeGrade, setActiveGrade] = useState(grades[0].id)
  const navigate = useNavigate()
  const grade = grades.find((item) => item.id === activeGrade) ?? grades[0]

  return (
    <div className="preschool-curriculum">
      <section className="preschool-curriculum-program" aria-labelledby="preschool-curriculum-title">
        <header className="preschool-curriculum-heading">
          <div>
            <span>Le cycle des apprentissages premiers</span>
            <h2 id="preschool-curriculum-title">Un parcours doux et progressif de 3 à 6 ans</h2>
          </div>
          <p>
            En maternelle, l'enfant apprend en jouant, en manipulant, en observant et
            en échangeant. Le langage occupe une place centrale dans toutes les
            activités proposées.
          </p>
        </header>

        <div className="preschool-grade-tabs" role="tablist" aria-label="Choisir une classe de maternelle">
          {grades.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              aria-selected={activeGrade === item.id}
              className={activeGrade === item.id ? 'preschool-grade-tab preschool-grade-tab--active' : 'preschool-grade-tab'}
              onClick={() => setActiveGrade(item.id)}
            >
              <strong>{item.shortLabel}</strong>
              <span>{item.label}</span>
              <small>{item.age}</small>
            </button>
          ))}
        </div>

        <article className="preschool-grade-panel">
          <header>
            <div>
              <span>{grade.label} · {grade.age}</span>
              <h3>{grade.focus}</h3>
            </div>
            <p>{grade.summary}</p>
          </header>

          <div className="preschool-domains">
            {grade.domains.map((domain) => (
              <section className="preschool-domain" key={domain.name}>
                <div>
                  <h4>{domain.name}</h4>
                  <span>{domain.frequency}</span>
                </div>
                <p>{domain.content}</p>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className="preschool-organization" aria-labelledby="preschool-organization-title">
        <header>
          <span>Organisation pédagogique</span>
          <h2 id="preschool-organization-title">Respecter le rythme de chaque enfant</h2>
          <p>
            La semaine nationale de maternelle comprend 24 heures. Les domaines ne
            disposent pas de quotas séparés : ils s'articulent quotidiennement dans
            des temps courts, variés et progressifs.
          </p>
        </header>

        <div className="preschool-organization-grid">
          <div className="preschool-hours-table">
            <div className="preschool-hours-row preschool-hours-row--heading">
              <span>Niveau</span>
              <span>Volume hebdomadaire</span>
              <span>Tarif mensuel</span>
            </div>
            {grades.map((item) => (
              <div className="preschool-hours-row" key={item.id}>
                <strong>{item.shortLabel}</strong>
                <span>{item.weeklyHours}</span>
                <span>{item.price} / mois</span>
              </div>
            ))}
          </div>

          <aside className="preschool-enrollment">
            <span className="preschool-enrollment-number">8</span>
            <h3>enfants maximum par classe</h3>
            <p>
              Ce petit effectif permet de faire parler chaque enfant, d'observer ses
              progrès et de lui proposer des activités adaptées à son développement.
            </p>
            <ul>
              <li>Accueil et rituels sécurisants</li>
              <li>Activités courtes et manipulatoires</li>
              <li>Évaluation positive sans notes</li>
              <li>Carnet de suivi partagé avec la famille</li>
            </ul>
          </aside>
        </div>

        <div className="preschool-pricing-note">
          <div>
            <span>Tarifs indicatifs sur 10 mensualités</span>
            <h3>Préparons une première expérience scolaire sereine</h3>
            <p>
              Un entretien avec la famille nous permet de connaître le rythme, les
              habitudes, les besoins et le niveau d'autonomie de l'enfant.
            </p>
          </div>
          <button type="button" onClick={() => navigate('/contact')}>
            Demander un entretien
          </button>
        </div>

        <p className="preschool-program-sources">
          Références : programme national du cycle 1, nouveaux programmes de langage
          et de mathématiques appliqués depuis la rentrée 2025, ressources Éduscol.
        </p>
      </section>
    </div>
  )
}

export default PreschoolCurriculum
