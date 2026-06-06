import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import './Navbar.css'
import { IconWhatsApp } from './ContactIcons'

const academicLevels = [
  { name: 'Lycée', path: '/lycee' },
  { name: 'Collège', path: '/college' },
  { name: 'Primaire', path: '/primaire' },
  { name: 'Maternelle', path: '/maternelle' }
]

const merkezSubjects = [
  'Arabe',
  'Sciences religieuses'
]

function Navbar() {
  const [isCurriculaOpen, setIsCurriculaOpen] = useState(false)
  const navigate = useNavigate()

  const handleContactClick = () => {
    setIsCurriculaOpen(false)
    navigate('/contact')
  }

  const handleHomeClick = () => {
    setIsCurriculaOpen(false)
    navigate('/')
  }

  const handleLevelClick = (path) => {
    setIsCurriculaOpen(false)
    navigate(path)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
          {/* LOGO - Cliquable pour retourner à l'accueil */}
        <div className="navbar-logo">
          <button className="logo-button" type="button" onClick={handleHomeClick}>
            <Logo />
          </button>
          {/* NUMÉRO DE TÉLÉPHONE - Affichage du numéro avec icône */}
          <div className="navbar-phone">
            <span className="link-icon"><IconWhatsApp /></span>
            <span className="phone-number">+33 1 23 45 67 89</span>
          </div>
        </div>



        {/* LIENS DE NAVIGATION */}
        <ul className="navbar-links">
          {/* Accueil - Bouton cliquable */}
          <li>
            <button className="nav-link-button" onClick={handleHomeClick}>Accueil</button>
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
              Nos cursus académiques
              <span aria-hidden="true"></span>
            </button>

            <div className={`navbar-curricula-menu${isCurriculaOpen ? ' navbar-curricula-menu--open' : ''}`}>
              <div className="navbar-curricula-group" role="menu">
                {academicLevels.map((level) => (
                  <button
                    type="button"
                    role="menuitem"
                    key={level.path}
                    onClick={() => handleLevelClick(level.path)}
                  >
                    {level.name}
                  </button>
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

          {/* À Propos - Lien vers une section (à implémenter) */}
          <li>
            <a href="#about">À Propos</a>
          </li>

          {/* Contact - Bouton cliquable pour aller à la page contact */}
          <li>
            <button className="nav-link-button" onClick={handleContactClick}>Contact</button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
