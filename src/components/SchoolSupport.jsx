import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './SchoolSupport.css'

const supportPrograms = [
  {
    number: '01',
    title: 'Soutien complet',
    description:
      "Un accompagnement transversal pour consolider l'ensemble du parcours scolaire et maintenir une progression régulière dans toutes les matières.",
    subjects: ['Toutes les matières du niveau', 'Méthodologie', 'Organisation', 'Préparation aux évaluations']
  },
  {
    number: '02',
    title: 'Soutien scientifique',
    description:
      'Un programme ciblé pour développer le raisonnement, reprendre les notions complexes et renforcer la maîtrise des disciplines scientifiques.',
    subjects: ['Mathématiques', 'Sciences physiques', 'SVT', 'Technologie']
  },
  {
    number: '03',
    title: 'Soutien littéraire',
    description:
      "Un suivi consacré à la compréhension, à l'expression et à la construction de repères solides dans les disciplines littéraires.",
    subjects: ['Français', 'Anglais', 'Histoire-géographie']
  }
]

const supportedSubjects = [
  {
    name: 'Français',
    type: 'french',
    description: 'Lecture, expression, grammaire et rédaction'
  },
  {
    name: 'Mathématiques',
    type: 'math',
    description: 'Calcul, raisonnement et résolution de problèmes'
  },
  {
    name: 'Histoire-géographie',
    type: 'history',
    description: 'Repères, territoires et analyse de documents'
  },
  {
    name: 'Anglais',
    type: 'english',
    description: 'Compréhension, vocabulaire et expression'
  },
  {
    name: 'SVT',
    type: 'biology',
    description: 'Vivant, planète, environnement et santé'
  },
  {
    name: 'Physique-chimie',
    type: 'physics',
    description: 'Matière, énergie, mouvements et expériences'
  },
  {
    name: 'Technologie',
    type: 'technology',
    description: 'Conception, systèmes et programmation'
  }
]

function SubjectCard({ subject }) {
  return (
    <article className={`school-subject-card school-subject-card--${subject.type}`}>
      <div className="school-subject-visual" aria-hidden="true">
        <span></span>
        <i></i>
        <b></b>
      </div>
      <div>
        <h4>{subject.name}</h4>
        <p>{subject.description}</p>
      </div>
    </article>
  )
}

function SchoolSupport() {
  const navigate = useNavigate()
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

  return (
    <section className="school-support" aria-labelledby="school-support-title">
      <div className="school-support-container">
        <header className="school-support-heading">
          <div>
            <span className="school-support-kicker">Nos programmes de soutien</span>
            <h2 id="school-support-title">Choisir un accompagnement adapté à ses besoins</h2>
          </div>
          <p>
            Des formules structurées pour consolider les acquis, retrouver confiance
            et avancer avec une méthode de travail claire.
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

        <section className="school-subjects-carousel" aria-labelledby="school-subjects-title">
          <header>
            <span>Les disciplines accompagnées</span>
            <h3 id="school-subjects-title">Sept matières, une même exigence de progression</h3>
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

        <section className="school-support-custom" aria-labelledby="custom-support-title">
          <div className="school-support-custom-intro">
            <span>Un parcours construit avec vous</span>
            <h3 id="custom-support-title">Soutien personnalisé</h3>
          </div>

          <div className="school-support-custom-copy">
            <p>
              Lorsque les besoins de l'élève ne correspondent pas à une formule
              standard, nous construisons un accompagnement sur mesure après une
              entrevue avec la famille et notre équipe pédagogique.
            </p>
            <p>
              Cet échange nous permet d'identifier les difficultés, les priorités, le
              rythme souhaité et les objectifs à atteindre avant de proposer un suivi
              cohérent et évolutif.
            </p>
          </div>

          <button type="button" onClick={() => navigate('/contact')}>
            Organiser une entrevue
          </button>
        </section>
      </div>
    </section>
  )
}

export default SchoolSupport
