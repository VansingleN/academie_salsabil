import LevelTree from './LevelTree'
import './Hero.css'

/**
 * COMPOSANT HERO (Section héroïque - Page d'accueil)
 * C'est la première section visible du site. Elle contient le titre,
 * la description et l'arbre des niveaux d'études.
 */
function Hero() {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Il n'est pas d'école qui égale un foyer digne, ni de maître qui remplace un parent vertueux.</h1>
            
            <p className="hero-subtitle">

C’est sur cette dualité entre le foyer et l’enseignement que s’inscrit l’Académie Salsabil.
Nous accompagnons les élèves, de la maternelle au lycée, à travers nos cursus complets, du soutien scolaire et de l’aide aux devoirs, avec un suivi attentif adapté à chaque niveau.

Notre mission est d’offrir aux familles un cadre rassurant et bienveillant, ancré dans des valeurs musulmanes authentiques, où chaque enfant peut apprendre sereinement, retrouver confiance et s’épanouir pleinement.</p>
            
            <button className="hero-cta">Découvrir l'académie</button>
          </div>

          <div className="hero-level-tree">
            <LevelTree />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
