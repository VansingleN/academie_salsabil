import { Link } from 'react-router-dom'
import './FinalCta.css'

function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="final-cta__content">
        <div>
          <span>Besoin d’être orienté ?</span>
          <h2 id="final-cta-title">Vous ne savez pas quel accompagnement choisir ?</h2>
          <p>
            Échangeons sur les besoins de votre enfant afin de vous guider vers la
            formule la plus adaptée.
          </p>
        </div>
        <Link to="/contact">Parler de votre besoin</Link>
      </div>
    </section>
  )
}

export default FinalCta
