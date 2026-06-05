import { useState } from 'react'
import faqVisual from '../images/faq_visual.webp'
import './FAQ.css'

const questions = [
  {
    question: 'Ou et comment se déroulent les cours ?',
    answer:
      'Les cours se déroulent principalement en ligne, dans un cadre structuré et interactif. Selon la formule choisie, l’élève suit ses séances en individuel, en petit groupe ou dans un cursus plus complet.'
  },
  {
    question: 'Quels sont les enseignements dispensés et programmes suivis ?',
    answer:
      'Nous accompagnons les élèves sur les matières fondamentales et les objectifs du niveau concerné. Les programmes sont construits pour consolider les bases, progresser avec méthode et préparer les évaluations importantes.'
  },
  {
    question: 'Qui dispense les cours ?',
    answer:
      'Les cours sont assurés par des intervenants sélectionnés pour leur sérieux, leur pédagogie et leur capacité à s’adapter au niveau de chaque élève. L’accompagnement reste bienveillant, clair et exigeant.'
  },
  {
    question: 'Quand se déroulent les cours ?',
    answer:
      'Les créneaux sont définis selon la formule, le niveau de l’élève et les disponibilités des familles. Les cours peuvent avoir lieu en semaine, en fin de journée ou sur des temps dédiés selon l’organisation retenue.'
  },
  {
    question: "Quel est l'effectif moyen d'une classe ?",
    answer:
      'Les groupes restent volontairement réduits afin de préserver l’attention portée à chaque élève. L’effectif varie selon le format, mais l’objectif reste toujours de favoriser la participation et le suivi.'
  },
  {
    question: "Quelle est la période d'ouverture des inscriptions ?",
    answer:
      'Les inscriptions ouvrent généralement avant la rentrée et peuvent rester accessibles selon les places disponibles. Pour certains formats, une intégration en cours d’année peut être proposée après échange avec l’équipe.'
  },
  {
    question: "Comment mon enfant est-il évalué au long de l'année ?",
    answer:
      'L’élève est suivi à travers ses exercices, sa participation, ses progrès et les difficultés repérées en séance. Des points réguliers permettent d’ajuster l’accompagnement et de garder une vision claire de son évolution.'
  },
  {
    question: 'Comment se passe la communication avec les équipes ?',
    answer:
      'La communication se fait de manière simple et régulière avec les familles. Les parents peuvent échanger avec l’équipe pour poser leurs questions, signaler une difficulté ou faire le point sur le parcours de leur enfant.'
  },
  {
    question: 'Quels sont les délais de rétractation ?',
    answer:
      'Les modalités de rétractation sont précisées lors de l’inscription, selon la formule choisie et le calendrier de démarrage. L’équipe reste disponible pour expliquer les conditions avant tout engagement.'
  },
  {
    question: 'Des aménagements sont-ils prévus pour les enfants DYS ?',
    answer:
      'Nous cherchons à adapter l’accompagnement lorsque l’élève présente des besoins spécifiques. Les familles peuvent nous transmettre les informations utiles afin d’envisager des aménagements réalistes et bénéfiques.'
  }
]

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(questions[0].question)

  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="faq-container">
        <div className="faq-heading">
          <span className="faq-kicker">Questions fréquentes</span>
          <h2 id="faq-title">Tout savoir avant de commencer</h2>
          <p>
            Retrouvez les réponses aux questions les plus courantes sur nos cours,
            l’organisation et le suivi des élèves.
          </p>
          <figure className="faq-visual">
            <img src={faqVisual} alt="Salle de classe illustrée" />
          </figure>
        </div>

        <div className="faq-list">
          {questions.map((item) => {
            const isOpen = openQuestion === item.question

            return (
              <article className={`faq-item${isOpen ? ' faq-item--open' : ''}`} key={item.question}>
                <button
                  className="faq-question"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenQuestion(isOpen ? '' : item.question)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon" aria-hidden="true"></span>
                </button>
                <div className="faq-answer" hidden={!isOpen}>
                  <p>{item.answer}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQ
