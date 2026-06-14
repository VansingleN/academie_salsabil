import { Link } from 'react-router-dom'
import './LevelPage.css'

function LevelPage({ level, children }) {
  return (
    <main className={`level-page level-page--${level.slug}`}>
      <section className="level-page-hero">
        <img
          className="level-page-hero-image"
          src={level.image}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />
        <div className="level-page-hero-content">
          <Link
            className="level-page-back"
            to="/"
          >
            Retour à l'accueil
          </Link>
          <span className="level-page-kicker">{level.eyebrow}</span>
          <h1>{level.title}</h1>
          <p>{level.intro}</p>
          <Link
            className="level-page-cta"
            to="/contact"
          >
            Échanger avec notre équipe
          </Link>
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
        <Link to="/contact">
          Demander des informations
        </Link>
      </section>

      {children}
    </main>
  )
}

export default LevelPage
