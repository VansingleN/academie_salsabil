import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import './Navbar.css'
import { IconWhatsApp } from './ContactIcons'
import {
  CART_ITEM_ADDED_EVENT,
  CART_UPDATED_EVENT,
  getCart
} from '../utils/cart'
import {
  cancelSummerCampPreload,
  preloadSummerCampAssets,
  scheduleSummerCampPreload
} from '../utils/preloadSummerCampAssets'

const academicLevels = [
  { name: 'Lycée', path: '/lycee' },
  { name: 'Collège', path: '/college' },
  { name: 'Primaire', path: '/primaire' },
  { name: 'Maternelle', path: '/maternelle' }
]

const academicServices = [
  { name: 'Soutien scolaire', path: '/soutien-scolaire' },
  { name: 'Instruction en famille', path: '/instruction-en-famille' }
]

const merkezSubjects = [
  'Arabe',
  'Sciences religieuses'
]

function Navbar() {
  const [isCurriculaOpen, setIsCurriculaOpen] = useState(false)
  const [cartCount, setCartCount] = useState(() => getCart().length)
  const [isCartHighlighted, setIsCartHighlighted] = useState(false)
  useEffect(() => {
    // Le compteur suit les changements du panier sans imposer un état global React.
    const refreshCartCount = () => setCartCount(getCart().length)
    let highlightTimer
    const highlightCart = () => {
      window.clearTimeout(highlightTimer)
      setIsCartHighlighted(true)
      highlightTimer = window.setTimeout(() => setIsCartHighlighted(false), 700)
    }
    window.addEventListener(CART_UPDATED_EVENT, refreshCartCount)
    window.addEventListener(CART_ITEM_ADDED_EVENT, highlightCart)
    window.addEventListener('storage', refreshCartCount)

    return () => {
      window.clearTimeout(highlightTimer)
      window.removeEventListener(CART_UPDATED_EVENT, refreshCartCount)
      window.removeEventListener(CART_ITEM_ADDED_EVENT, highlightCart)
      window.removeEventListener('storage', refreshCartCount)
    }
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-container">
          {/* LOGO - Cliquable pour retourner à l'accueil */}
        <div className="navbar-brand">
          <Link className="logo-button" to="/" onClick={() => setIsCurriculaOpen(false)}>
            <Logo />
          </Link>
          {/* NUMÉRO DE TÉLÉPHONE - Affichage du numéro avec icône */}
          <div className="navbar-phone">
            <span className="link-icon"><IconWhatsApp /></span>
            <span className="phone-number">+33 1 23 45 67 89</span>
          </div>
        </div>



        {/* LIENS DE NAVIGATION */}
        <ul className="navbar-links">
          <li>
            <Link
              className="nav-link-button nav-link-button--seasonal"
              to="/summer-camp"
              onMouseEnter={scheduleSummerCampPreload}
              onMouseLeave={cancelSummerCampPreload}
              onFocus={preloadSummerCampAssets}
              onPointerDown={preloadSummerCampAssets}
              onClick={() => setIsCurriculaOpen(false)}
            >
              Summer Camp
            </Link>
          </li>

          <li
            className="navbar-curricula"
            onMouseLeave={() => setIsCurriculaOpen(false)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsCurriculaOpen(false)
            }}
          >
            <button
              className="nav-link-button navbar-curricula-trigger"
              type="button"
              aria-expanded={isCurriculaOpen}
              aria-haspopup="menu"
              onClick={() => setIsCurriculaOpen((isOpen) => !isOpen)}
            >
              Nos accompagnements
              <span aria-hidden="true"></span>
            </button>

            <div className={`navbar-curricula-menu${isCurriculaOpen ? ' navbar-curricula-menu--open' : ''}`}>
              <div className="navbar-curricula-group" role="menu">
                <span className="navbar-curricula-label">Accompagnements</span>
                {academicServices.map((service) => (
                  <Link
                    role="menuitem"
                    key={service.path}
                    to={service.path}
                    onClick={() => setIsCurriculaOpen(false)}
                  >
                    {service.name}
                  </Link>
                ))}

                <span className="navbar-curricula-label navbar-curricula-label--levels">
                  Cursus scolaires
                </span>
                {academicLevels.map((level) => (
                  <Link
                    role="menuitem"
                    key={level.path}
                    to={level.path}
                    onClick={() => setIsCurriculaOpen(false)}
                  >
                    {level.name}
                  </Link>
                ))}
              </div>

              <div className="navbar-curricula-separator" aria-hidden="true">
                <span></span>
              </div>

              <div className="navbar-curricula-group navbar-curricula-group--merkez" role="menu">
                {merkezSubjects.map((subject) => (
                  <a
                    href="https://silly-medovik-9b36bd.netlify.app/"
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                    key={subject}
                    onClick={() => setIsCurriculaOpen(false)}
                  >
                    {subject}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </li>

          <li>
            <Link className="nav-link-button" to="/a-propos" onClick={() => setIsCurriculaOpen(false)}>
              À Propos
            </Link>
          </li>

          {/* Contact - Bouton cliquable pour aller à la page contact */}
          <li>
            <Link className="nav-link-button" to="/contact" onClick={() => setIsCurriculaOpen(false)}>Contact</Link>
          </li>

          <li>
            {/* Le libellé accessible annonce aussi le nombre d'inscriptions. */}
            <Link
              className={`navbar-cart-button${isCartHighlighted ? ' navbar-cart-button--highlighted' : ''}`}
              to="/panier"
              aria-label={`Ouvrir le panier, ${cartCount} inscription${cartCount > 1 ? 's' : ''}`}
              onClick={() => setIsCurriculaOpen(false)}
            >
              <span>Panier</span>
              <strong>{cartCount}</strong>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
