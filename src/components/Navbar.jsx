import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import './Navbar.css'
import { IconWhatsApp } from './ContactIcons'

const academicSubjects = [
  'Français',
  'Mathématiques',
  'Histoire-géographie',
  'Anglais',
  // 'Espagnol',
  'Sciences de la vie et de la Terre',
  'Physique-chimie',
  'Technologie'
]

const merkezSubjects = [
  'Arabe',
  'Sciences religieuses'
]

function Navbar() {
  const [isProgramsOpen, setIsProgramsOpen] = useState(false)
  const navigate = useNavigate()

  const handleContactClick = () => {
    setIsProgramsOpen(false)
    navigate('/contact')
  }

  const handleHomeClick = () => {
    setIsProgramsOpen(false)
    navigate('/')
  }

  const handleProgramsClick = () => {
    setIsProgramsOpen(false)
    navigate('/programmes')
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
            className="navbar-programs"
            onMouseLeave={() => setIsProgramsOpen(false)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsProgramsOpen(false)
            }}
          >
            <button
              className="nav-link-button navbar-programs-trigger"
              type="button"
              aria-expanded={isProgramsOpen}
              aria-haspopup="menu"
              onClick={() => setIsProgramsOpen((isOpen) => !isOpen)}
            >
              Nos programmes académiques
              <span aria-hidden="true"></span>
            </button>

            <div className={`navbar-programs-menu${isProgramsOpen ? ' navbar-programs-menu--open' : ''}`}>
              <div className="navbar-programs-group" role="menu">
                {academicSubjects.map((subject) => (
                  <button type="button" role="menuitem" key={subject} onClick={handleProgramsClick}>
                    {subject}
                  </button>
                ))}
              </div>

              <div className="navbar-programs-separator" aria-hidden="true">
                <span></span>
              </div>

              <div className="navbar-programs-group navbar-programs-group--merkez" role="menu">
                {merkezSubjects.map((subject) => (
                  <a
                    href="https://silly-medovik-9b36bd.netlify.app/"
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                    key={subject}
                    onClick={() => setIsProgramsOpen(false)}
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
