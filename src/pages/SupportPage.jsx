import { Link } from 'react-router-dom'
import SchoolSupport from '../components/SchoolSupport'
import supportBanner from '../images/banner_school_support.webp'
import './SupportPage.css'

function SupportPage() {
  return (
    <main className="support-page">
      <section
        className="support-page__hero"
        aria-labelledby="support-page-title"
        style={{ '--support-banner': `url(${supportBanner})` }}
      >
        <div>
          <Link to="/">← Retour à l’accueil</Link>
          <span>Soutien scolaire en ligne</span>
          <h1 id="support-page-title">Retrouver des bases solides et avancer avec confiance</h1>
          <p>
            Un accompagnement ponctuel ou régulier, adapté au niveau, aux difficultés
            et aux objectifs de chaque élève.
          </p>
          <div className="support-page__hero-actions">
            <Link to="/demande-soutien?parcours=creneau">
              Demander un créneau
            </Link>
            <a href="#support-needs">
              Découvrir les accompagnements
            </a>
          </div>
        </div>
      </section>

      <SchoolSupport />
    </main>
  )
}

export default SupportPage
