import { useState } from 'react'
import { Link } from 'react-router-dom'
import faqVisual from '../images/faq_visual.webp'
import faqMascot from '../images/faq_mascot.webp'
import { faqQuestions } from '../data/faqQuestions'
import './FAQ.css'

function FAQ({
  questions = faqQuestions,
  compact = false,
  id = 'faq',
  title = 'Tout savoir avant de commencer',
  introduction = 'Retrouvez les réponses aux questions les plus courantes sur nos cours, l’organisation et le suivi des élèves.',
  completeFaqLink = false
}) {
  const [openQuestion, setOpenQuestion] = useState(questions[0]?.question ?? '')

  return (
    <section
      className={`faq${compact ? ' faq--compact' : ''}`}
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="faq-container">
        <div className="faq-heading">
          <span className="faq-kicker">Questions fréquentes</span>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{introduction}</p>
          {compact && (
            <figure className="faq-mascot" aria-hidden="true">
              <img src={faqMascot} alt="" loading="lazy" decoding="async" />
            </figure>
          )}
          {!compact && (
            <figure className="faq-visual">
              <img src={faqVisual} alt="Salle de classe illustrée" loading="lazy" />
            </figure>
          )}
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
          {completeFaqLink && (
            <div className="faq-complete-link">
              <span>Vous avez une autre question ?</span>
              <Link to="/contact#faq">Consulter toute la FAQ <span aria-hidden="true">→</span></Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FAQ
