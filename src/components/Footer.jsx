import { Link } from 'react-router-dom'
import Logo from './Logo'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo-button" aria-label="Retour à l’accueil">
              <Logo className="footer-logo" />
            </Link>
            <p>
              Un accompagnement scolaire attentif, structuré et bienveillant, de la
              maternelle au lycée.
            </p>
          </div>

          <nav className="footer-navigation" aria-label="Navigation de pied de page">
            <h2>Navigation</h2>
            <Link to="/a-propos#method">Notre méthode</Link>
            <Link to="/#online-courses-title">Nos solutions</Link>
            <Link to="/summer-camp">Summer Camp</Link>
            <Link to="/contact#faq">Questions fréquentes</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="footer-contact">
            <h2>Nous contacter</h2>
            <a href="mailto:contact@academiesalsabil.fr">contact@academiesalsabil.fr</a>
            <a href="tel:+33123456789">+33 1 23 45 67 89</a>
            <p>Accompagnement et cours en ligne</p>
          </div>

          <aside className="footer-merkez">
            <span>Programme religieux musulman</span>
            <h2>Merkez Salsabil</h2>
            <p>
              Une branche dédiée à la transmission d'un savoir authentique, clair et
              enraciné dans la tradition des gens de la Sunna.
            </p>
            <a
              href="https://silly-medovik-9b36bd.netlify.app/"
              target="_blank"
              rel="noreferrer"
            >
              Visiter le site du Merkez
            </a>
          </aside>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Académie Salsabil. Tous droits réservés.</p>
          <div>
            <Link to="/conditions-generales-de-vente">Conditions générales de vente</Link>
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/politique-de-confidentialite">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
