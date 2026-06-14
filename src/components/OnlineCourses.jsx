import { useState } from 'react'
import { Link } from 'react-router-dom'
import classOilPainting from '../images/class_oilpainting.webp'
import homeworksImage from '../images/homeworks.webp'
import schoolImage from '../images/school_oilpainting.webp'
import houseImage from '../images/house_oilpainting.webp'
import './OnlineCourses.css'

const offers = [
  {
    tab: 'Aide aux devoirs',
    image: homeworksImage,
    imageAlt: 'Élève accompagné pour ses devoirs',
    title: "Un accompagnement régulier pour avancer sereinement après l'école",
    blocks: [
      {
        heading: 'Des devoirs mieux compris',
        paragraphs: [
          <>Nous aidons l'élève à reprendre les consignes, organiser son travail et terminer ses exercices avec méthode.</>,
          <>L'objectif est de développer de vrais réflexes : <strong>compréhension, autonomie, confiance et régularité.</strong></>
        ]
      },
      {
        heading: 'Un cadre rassurant pour les familles',
        paragraphs: [
          <>Chaque séance permet de lever les blocages du moment, revoir les notions fragiles et préparer les évaluations à venir.</>,
          <>Les parents gagnent en tranquillité, l'enfant garde un rythme clair et progresse sans pression inutile.</>
        ]
      }
    ],
    advantages: [
      'Suivi adapté au rythme de l’élève',
      'Méthode de travail et organisation',
      'Révisions ciblées avant les contrôles',
      'Retour progressif vers l’autonomie'
    ]
  },
  {
    tab: 'Soutien scolaire',
    image: classOilPainting,
    imageAlt: 'Classe illustrée pour le soutien scolaire',
    title: 'Des cours ciblés pour consolider les bases et reprendre confiance',
    blocks: [
      {
        heading: 'Reprendre les notions essentielles',
        paragraphs: [
          <>Le soutien scolaire permet de revenir sur les chapitres mal compris et de combler les lacunes avant qu'elles ne s'installent.</>,
          <>Nous travaillons les matières clés avec une approche claire : <strong>expliquer, s'entraîner, vérifier, progresser.</strong></>
        ]
      },
      {
        heading: 'Un accompagnement sur mesure',
        paragraphs: [
          <>Les séances s'adaptent au niveau, aux objectifs et aux difficultés de chaque élève, du primaire au lycée.</>,
          <>Le suivi peut être ponctuel pour une difficulté précise ou régulier pour retrouver un niveau solide dans la durée.</>
        ]
      }
    ],
    advantages: [
      'Cours personnalisés par matière',
      'Remise à niveau progressive',
      'Préparation aux évaluations',
      'Suivi clair des progrès'
    ]
  },
  {
    tab: 'Cursus complet',
    image: schoolImage,
    imageAlt: 'Élèves suivant un cursus complet',
    title: 'Un parcours structuré pour apprendre toute l’année avec cohérence',
    blocks: [
      {
        heading: 'Un programme organisé',
        paragraphs: [
          <>Le cursus complet accompagne l'élève sur l'ensemble de l'année avec une progression pensée pour son niveau.</>,
          <>Les apprentissages sont construits dans la durée : <strong>cours, exercices, révisions et consolidation des acquis.</strong></>
        ]
      },
      {
        heading: 'Une continuité pédagogique',
        paragraphs: [
          <>Ce format convient aux familles qui souhaitent un cadre complet, stable et exigeant, tout en gardant une attention personnalisée.</>,
          <>L'élève avance avec des repères réguliers et une vision claire des objectifs à atteindre.</>
        ]
      }
    ],
    advantages: [
      'Progression annuelle structurée',
      'Cadre complet et régulier',
      'Supports pédagogiques adaptés',
      'Accompagnement de la maternelle au lycée'
    ]
  },
  {
    tab: 'Instruction en famille',
    image: houseImage,
    imageAlt: 'Accompagnement pédagogique pour l’instruction en famille',
    title: 'Un soutien pensé pour les familles qui instruisent à domicile',
    blocks: [
      {
        heading: 'Accompagner sans remplacer la famille',
        paragraphs: [
          <>Nous aidons les parents à structurer les apprentissages, clarifier les objectifs et renforcer les matières importantes.</>,
          <>L'accompagnement respecte le rythme familial tout en apportant un cadre pédagogique fiable et rassurant.</>
        ]
      },
      {
        heading: 'Des repères solides pour avancer',
        paragraphs: [
          <>Les séances peuvent soutenir une matière précise, préparer une étape importante ou aider à organiser une progression complète.</>,
          <>Chaque parcours vise l'équilibre entre <strong>exigence, sérénité, autonomie et transmission.</strong></>
        ]
      }
    ],
    advantages: [
      'Aide à la structuration du programme',
      'Respect du rythme familial',
      'Renfort dans les matières clés',
      'Suivi pédagogique souple et régulier'
    ]
  }
]

const courseLevels = [
  { name: 'Maternelle', path: '/maternelle' },
  { name: 'Primaire', path: '/primaire' },
  { name: 'Collège', path: '/college' },
  { name: 'Lycée', path: '/lycee' }
]

function OnlineCourses() {
  const [activeTab, setActiveTab] = useState(offers[0].tab)
  const activeOffer = offers.find((offer) => offer.tab === activeTab) ?? offers[0]

  return (
    <section className="online-courses" aria-labelledby="online-courses-title">
      <div className="online-courses-container">
        <header className="online-courses-header">
          <h2 id="online-courses-title">Découvrez nos solutions adaptées à chaque élève</h2>
          <span className="online-courses-rule" aria-hidden="true"></span>
          <p>Nos cours sont sans engagement</p>
        </header>

        <div className="online-courses-tabs" role="tablist" aria-label="Solution proposée">
          {offers.map((offer) => (
            <button
              key={offer.tab}
              className={`online-courses-tab${activeTab === offer.tab ? ' online-courses-tab--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeTab === offer.tab}
              onClick={() => setActiveTab(offer.tab)}
            >
              {offer.tab}
            </button>
          ))}
        </div>

        <div className="online-courses-panel">
          <div className="online-courses-copy">
            <h3>{activeOffer.title}</h3>

            {activeOffer.blocks.map((block) => (
              <div className="online-courses-block" key={block.heading}>
                <h4>{block.heading}</h4>
                {block.paragraphs.map((paragraph, index) => (
                  <p key={`${block.heading}-${index}`}>{paragraph}</p>
                ))}
              </div>
            ))}

            {activeOffer.tab === 'Cursus complet' ? (
              <div className="online-courses-level-actions" aria-label="Choisir un cursus par niveau">
                {courseLevels.map((level) => (
                  <Link
                    className="online-courses-level-cta"
                    key={level.path}
                    to={level.path}
                  >
                    {level.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                className="online-courses-cta"
                to={
                  activeOffer.tab === 'Instruction en famille'
                    ? '/instruction-en-famille'
                    : activeOffer.tab === 'Soutien scolaire'
                      ? '/soutien-scolaire'
                    : '/contact'
                }
              >
                {activeOffer.tab === 'Soutien scolaire'
                  ? 'Découvrir le soutien scolaire'
                  : 'Je me renseigne'}
              </Link>
            )}
          </div>

          <aside className="online-courses-benefits" aria-label="Avantages des cours en ligne">
            <h3>Avantages Académie</h3>
            <ul>
              {activeOffer.advantages.map((advantage) => (
                <li key={advantage}>{advantage}</li>
              ))}
            </ul>

            <div className="online-courses-visual">
              {offers.map((offer, index) => (
                <img
                  key={offer.tab}
                  className={activeOffer.tab === offer.tab ? 'online-courses-image--active' : ''}
                  src={offer.image}
                  alt={activeOffer.tab === offer.tab ? offer.imageAlt : ''}
                  aria-hidden={activeOffer.tab !== offer.tab}
                  loading="eager"
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default OnlineCourses
