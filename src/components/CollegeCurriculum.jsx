import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CollegeCurriculum.css'

const grades = [
  {
    id: '6e',
    label: '6e',
    cycle: 'Cycle 3 - consolidation',
    summary:
      "La sixième assure la transition avec l'école primaire. L'élève consolide les fondamentaux, découvre les méthodes du collège et apprend à organiser son travail dans plusieurs disciplines.",
    weeklyHours: '19 h',
    price: '449 €',
    subjects: [
      {
        name: 'Français',
        hours: '4 h 30',
        content:
          "Lecture d'œuvres intégrales et de textes variés, compréhension fine, expression orale, rédaction régulière, enrichissement du vocabulaire, grammaire, conjugaison et orthographe."
      },
      {
        name: 'Anglais',
        hours: '4 h',
        content:
          "Comprendre et produire des messages simples, interagir dans des situations familières, acquérir le vocabulaire du quotidien et découvrir des repères culturels du monde anglophone."
      },
      {
        name: 'Histoire-géographie',
        hours: '3 h',
        content:
          "Étude des premières civilisations, du monde grec, de Rome et des débuts des grands monothéismes ; découverte de la répartition de la population et des manières d'habiter le monde."
      },
      {
        name: 'Mathématiques',
        hours: '4 h 30',
        content:
          "Nombres entiers et décimaux, fractions simples, proportionnalité et pourcentages, calcul mental, résolution de problèmes, géométrie, grandeurs, surfaces, volumes et premières données statistiques."
      },
      {
        name: 'Sciences physiques',
        hours: 'Bloc sciences',
        content:
          "Premières démarches expérimentales autour de la matière, de l'énergie, des mouvements, des signaux et des phénomènes observables dans l'environnement quotidien."
      },
      {
        name: 'SVT',
        hours: '3 h partagées',
        content:
          "Diversité du vivant, classification, besoins des organismes, relations avec leur milieu, fonctionnement du corps humain et compréhension progressive de la planète Terre."
      },
      {
        name: 'Technologie',
        hours: 'Intégrée aux projets',
        content:
          "Observation des objets techniques, fonctions d'usage, matériaux, énergie et initiation à la conception à travers des projets interdisciplinaires de sciences et technologie."
      }
    ]
  },
  {
    id: '5e',
    label: '5e',
    cycle: 'Cycle 4 - approfondissements',
    summary:
      "La cinquième ouvre le cycle des approfondissements. Les élèves développent leur autonomie, apprennent à justifier leurs démarches et relient davantage les connaissances entre elles.",
    weeklyHours: '18 h 30',
    price: '459 €',
    subjects: [
      {
        name: 'Français',
        hours: '4 h 30',
        content:
          "Récits de voyage et d'aventure, héros et héroïsmes, poésie et imagination, questionnement sur l'être humain ; approfondissement de la langue, de l'argumentation et de l'écriture longue."
      },
      {
        name: 'Anglais',
        hours: '3 h',
        content:
          "Compréhension de documents plus développés, prise de parole préparée, échanges simples et continus, rédaction de textes courts et approfondissement des cultures anglophones."
      },
      {
        name: 'Histoire-géographie',
        hours: '3 h',
        content:
          "Chrétientés et islam médiévaux, société féodale et ouverture de l'Europe ; démographie, développement, gestion des ressources et adaptation aux risques et au changement global."
      },
      {
        name: 'Mathématiques',
        hours: '3 h 30',
        content:
          "Nombres relatifs, fractions, proportionnalité, calcul littéral, statistiques, probabilités simples, transformations géométriques, solides et initiation progressive à l'algorithmique."
      },
      {
        name: 'Sciences physiques',
        hours: '1 h 30',
        content:
          "États et transformations de la matière, mélanges, mouvements, interactions, énergie, circuits électriques simples, lumière et communication par signaux."
      },
      {
        name: 'SVT',
        hours: '1 h 30',
        content:
          "Fonctionnement de la planète, phénomènes météorologiques et géologiques, nutrition des organismes, écosystèmes, biodiversité et responsabilité humaine."
      },
      {
        name: 'Technologie',
        hours: '1 h 30',
        content:
          "Analyse des besoins, fonctionnement des objets et systèmes, choix des matériaux, représentation, programmation et premières étapes d'une démarche de conception."
      }
    ]
  },
  {
    id: '4e',
    label: '4e',
    cycle: 'Cycle 4 - approfondissements',
    summary:
      "En quatrième, les raisonnements deviennent plus complexes. L'élève apprend à argumenter, modéliser, expérimenter et travailler sur des productions plus longues et plus autonomes.",
    weeklyHours: '18 h 30',
    price: '459 €',
    subjects: [
      {
        name: 'Français',
        hours: '4 h 30',
        content:
          "Individu et société, confrontation des valeurs, information, fiction et réel, poésie du monde ; analyse littéraire, écriture argumentative, maîtrise des phrases complexes et précision grammaticale."
      },
      {
        name: 'Anglais',
        hours: '3 h',
        content:
          "Interaction plus spontanée, compréhension de récits et de documents authentiques, expression d'une opinion, rédaction structurée et étude de thèmes historiques et culturels anglophones."
      },
      {
        name: 'Histoire-géographie',
        hours: '3 h',
        content:
          "Lumières, révolutions, industrialisation et sociétés du XIXe siècle ; urbanisation mondiale, migrations, tourisme et transformation des territoires par la mondialisation."
      },
      {
        name: 'Mathématiques',
        hours: '3 h 30',
        content:
          "Puissances, calcul littéral, équations, proportionnalité, fonctions, statistiques et probabilités ; théorème de Pythagore, transformations, géométrie dans l'espace et programmation."
      },
      {
        name: 'Sciences physiques',
        hours: '1 h 30',
        content:
          "Constitution de la matière, transformations chimiques, vitesse, forces, énergie, électricité, propagation de la lumière et exploitation quantitative des mesures."
      },
      {
        name: 'SVT',
        hours: '1 h 30',
        content:
          "Dynamique interne de la Terre, reproduction, puberté, système nerveux, alimentation, évolution des écosystèmes et effets des activités humaines sur l'environnement."
      },
      {
        name: 'Technologie',
        hours: '1 h 30',
        content:
          "Conception de solutions, modélisation, simulation, chaîne d'information et d'énergie, programmation d'objets connectés et organisation méthodique d'un projet collectif."
      }
    ]
  },
  {
    id: '3e',
    label: '3e',
    cycle: 'Cycle 4 - orientation et brevet',
    summary:
      "La troisième consolide les acquis du collège, prépare le diplôme national du brevet et accompagne l'élève dans son orientation vers le lycée général, technologique ou professionnel.",
    weeklyHours: '18 h 30',
    price: '489 €',
    subjects: [
      {
        name: 'Français',
        hours: '4 h',
        content:
          "Écriture de soi, dénonciation des travers de la société, visions poétiques du monde et agir dans la cité ; analyse, argumentation, dictée, grammaire et entraînement méthodique aux épreuves du brevet."
      },
      {
        name: 'Anglais',
        hours: '3 h',
        content:
          "Compréhension de supports authentiques, conversation suivie, argumentation simple, rédaction organisée et consolidation du niveau attendu à la fin du collège."
      },
      {
        name: 'Histoire-géographie',
        hours: '3 h 30',
        content:
          "Guerres mondiales, totalitarismes, monde depuis 1945 et République française ; dynamiques territoriales, aménagement, France et Union européenne, avec préparation aux analyses de documents du brevet."
      },
      {
        name: 'Mathématiques',
        hours: '3 h 30',
        content:
          "Arithmétique, calcul littéral, équations, fonctions affines, statistiques, probabilités, trigonométrie, théorèmes de Thalès et Pythagore, algorithmique et résolution de sujets type brevet."
      },
      {
        name: 'Sciences physiques',
        hours: '1 h 30',
        content:
          "Structure de la matière, ions et réactions chimiques, mécanique, énergie, puissance électrique, signaux et entraînement à l'analyse scientifique attendue au brevet."
      },
      {
        name: 'SVT',
        hours: '1 h 30',
        content:
          "Génétique, évolution, immunité, santé, ressources naturelles, climat et impacts environnementaux, avec mobilisation des données et construction d'un raisonnement scientifique."
      },
      {
        name: 'Technologie',
        hours: '1 h 30',
        content:
          "Projet complet de conception, cahier des charges, choix techniques, modélisation, programmation, réseaux, objets communicants et présentation argumentée d'une solution."
      }
    ]
  }
]

function CollegeCurriculum() {
  const [activeGrade, setActiveGrade] = useState(grades[0].id)
  const navigate = useNavigate()
  const grade = grades.find((item) => item.id === activeGrade) ?? grades[0]

  return (
    <div className="college-curriculum">
      <section className="college-curriculum-program" aria-labelledby="college-curriculum-title">
        <header className="college-curriculum-heading">
          <div>
            <span>Le cursus académique français</span>
            <h2 id="college-curriculum-title">Un programme détaillé de la 6e à la 3e</h2>
          </div>
          <p>
            Notre progression suit les programmes nationaux en vigueur tout en
            conservant des classes à effectif réduit, des évaluations régulières et un
            suivi attentif de chaque élève.
          </p>
        </header>

        <div className="college-grade-tabs" role="tablist" aria-label="Choisir une classe du collège">
          {grades.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              aria-selected={activeGrade === item.id}
              className={activeGrade === item.id ? 'college-grade-tab college-grade-tab--active' : 'college-grade-tab'}
              onClick={() => setActiveGrade(item.id)}
            >
              <strong>{item.label}</strong>
              <span>{item.cycle}</span>
            </button>
          ))}
        </div>

        <article className="college-grade-panel">
          <header>
            <div>
              <span>Classe de {grade.label}</span>
              <h3>{grade.cycle}</h3>
            </div>
            <p>{grade.summary}</p>
          </header>

          <div className="college-subjects">
            {grade.subjects.map((subject) => (
              <section className="college-subject" key={subject.name}>
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

      <section className="college-organization" aria-labelledby="college-organization-title">
        <header>
          <span>Organisation pédagogique</span>
          <h2 id="college-organization-title">Un cadre exigeant à taille humaine</h2>
          <p>
            Les volumes ci-dessous correspondent aux disciplines académiques
            présentées sur cette page. Ils ne comprennent pas les enseignements
            artistiques, l'EPS, l'EMC ou une éventuelle seconde langue vivante.
          </p>
        </header>

        <div className="college-organization-grid">
          <div className="college-hours-table">
            <div className="college-hours-row college-hours-row--heading">
              <span>Niveau</span>
              <span>Volume hebdomadaire</span>
              <span>Tarif mensuel</span>
            </div>
            {grades.map((item) => (
              <div className="college-hours-row" key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.weeklyHours}</span>
                <span>{item.price} / mois</span>
              </div>
            ))}
          </div>

          <aside className="college-enrollment">
            <span className="college-enrollment-number">12</span>
            <h3>élèves maximum par classe</h3>
            <p>
              Cet effectif permet davantage d'interactions, une correction attentive
              des travaux et une adaptation rapide lorsque des difficultés apparaissent.
            </p>
            <ul>
              <li>Positionnement initial</li>
              <li>Bilans réguliers transmis aux familles</li>
              <li>Évaluations et devoirs corrigés</li>
              <li>Préparation au brevet dès la 4e</li>
            </ul>
          </aside>
        </div>

        <div className="college-pricing-note">
          <div>
            <span>Tarifs indicatifs sur 10 mensualités</span>
            <h3>Construisons le parcours adapté à votre enfant</h3>
            <p>
              Le tarif définitif dépend de la formule retenue, des options et des
              éventuels besoins d'accompagnement individuel identifiés avec la famille.
            </p>
          </div>
          <button type="button" onClick={() => navigate('/contact')}>
            Demander un entretien
          </button>
        </div>

        <p className="college-program-sources">
          Références : programmes et horaires publiés par le ministère de l'Éducation
          nationale et Éduscol, adaptés à notre présentation pédagogique.
        </p>
      </section>
    </div>
  )
}

export default CollegeCurriculum
