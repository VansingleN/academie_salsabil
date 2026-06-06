import { useNavigate } from 'react-router-dom'
import './LevelPage.css'

function LevelPage({ level, children }) {
  const navigate = useNavigate()

  return (
    <main className={`level-page level-page--${level.slug}`}>
      <section
        className="level-page-hero"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(8, 58, 37, 0.88), rgba(8, 58, 37, 0.3)), url(${level.image})` }}
      >
        <div className="level-page-hero-content">
          <button
            className="level-page-back"
            type="button"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </button>
          <span className="level-page-kicker">{level.eyebrow}</span>
          <h1>{level.title}</h1>
          <p>{level.intro}</p>
          <button
            className="level-page-cta"
            type="button"
            onClick={() => navigate('/contact')}
          >
            Échanger avec notre équipe
          </button>
        </div>
      </section>

      <section className="level-page-program" aria-labelledby={`${level.slug}-program-title`}>
        <div className="level-page-program-intro">
          <span>Le programme</span>
          <h2 id={`${level.slug}-program-title`}>{level.programTitle}</h2>
          <p>{level.programIntro}</p>
        </div>

        <div className="level-page-pillars">
          {level.pillars.map((pillar, index) => (
            <article key={pillar.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="level-page-support">
        <div>
          <span>Un suivi attentif</span>
          <h2>{level.supportTitle}</h2>
        </div>
        <p>{level.supportText}</p>
        <button type="button" onClick={() => navigate('/contact')}>
          Demander des informations
        </button>
      </section>

      {children}
    </main>
  )
}

export default LevelPage
