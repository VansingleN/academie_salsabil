import { Link } from 'react-router-dom'
import academyHeroPanorama from '../images/academy_home_hero_panorama.jpg'
import './Hero.css'

function Hero() {
  const scrollToSolutions = () => {
    document.getElementById('online-courses-title')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <section
      className="hero"
      aria-labelledby="home-hero-title"
      style={{ '--hero-background': `url(${academyHeroPanorama})` }}
    >
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-kicker">Académie Salsabil</span>
            <h1 id="home-hero-title">
              Apprendre avec confiance, grandir avec des repères
            </h1>
            <p>
              Des accompagnements en ligne attentifs et structurés pour aider
              chaque élève à progresser à son rythme, dans un cadre rassurant
              pour toute la famille.
            </p>

            <div className="hero-actions">
              <button type="button" onClick={scrollToSolutions}>
                Découvrir nos accompagnements
              </button>
              <Link to="/contact">
                Échanger avec l’équipe
              </Link>
            </div>

            <ul className="hero-reassurance" aria-label="Nos engagements">
              <li>Cours en ligne</li>
              <li>Suivi humain</li>
              <li>Parcours personnalisés</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
