import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Contact.css'
import Logo from './Logo'
import FAQ from './FAQ'
import { submitContactMessage } from '../utils/contactMessageApi'
import {
  IconEmail,
  IconWhatsApp,
  IconTelegram,
  IconInstagram,
  IconFaq,
} from './ContactIcons'

function Contact() {
  const { hash, search } = useLocation()
  const navigate = useNavigate()
  const [isFaqManuallyOpen, setIsFaqManuallyOpen] = useState(false)
  const isFaqOpen = hash === '#faq' || isFaqManuallyOpen
  const requestedService = new URLSearchParams(search).get('service')
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    message: requestedService === 'soutien-scolaire'
      ? 'Bonjour, je souhaite être conseillé(e) pour un accompagnement de soutien scolaire.'
      : '',
    consent: false,
    website: '',
    formStartedAt: new Date().toISOString()
  })
  const [submission, setSubmission] = useState({
    status: 'idle',
    message: '',
    reference: ''
  })

  const handleFaqToggle = () => {
    const willOpen = !isFaqOpen
    setIsFaqManuallyOpen(willOpen)

    if (willOpen) {
      navigate('/contact#faq')
    } else if (hash === '#faq') {
      navigate('/contact', { replace: true })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmission({ status: 'loading', message: '', reference: '' })

    try {
      const result = await submitContactMessage(formData)
      setSubmission({
        status: 'success',
        message: '',
        reference: result.reference
      })
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        message: '',
        consent: false,
        website: '',
        formStartedAt: new Date().toISOString()
      })
    } catch (error) {
      setSubmission({
        status: 'error',
        message: error.message,
        reference: ''
      })
    }
  }

  return (
    <>
      <section className="contact">
        <div className="contact-container">
        <div className="contact-form-column">
        <h2 className="form-title">Formulaire de contact</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-honeypot" aria-hidden="true">
            <label>
              Votre site internet
              <input
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex="-1"
                autoComplete="off"
              />
            </label>
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="Prénom *"
                aria-label="Prénom"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Nom *"
                aria-label="Nom"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email *"
              aria-label="Email"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Numéro de téléphone"
              aria-label="Numéro de téléphone"
            />
          </div>

          <div className="form-group">
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder="Message *"
              aria-label="Message"
              required
            ></textarea>
          </div>

          <label className="contact-consent">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              aria-describedby="contact-privacy-note"
              required
            />
            <span>J’accepte d’être recontacté au sujet de ce message. *</span>
          </label>
          <p className="contact-privacy-note" id="contact-privacy-note">
            Vos informations servent uniquement à traiter votre message. Elles sont
            traitées pendant 12 mois au maximum, puis supprimées après un délai
            technique de 30 jours. Une clôture anticipée réduit cette durée.{' '}
            <Link to="/politique-de-confidentialite">En savoir plus</Link>.
          </p>

          <button
            type="submit"
            className="contact-button"
            disabled={submission.status === 'loading'}
          >
            {submission.status === 'loading' ? 'Enregistrement…' : 'Envoyer'}
          </button>

          {submission.status === 'success' && (
            <div className="contact-form-feedback contact-form-feedback--success" role="status">
              <strong>Votre message a bien été enregistré.</strong>
              <p>Référence : {submission.reference}</p>
            </div>
          )}

          {submission.status === 'error' && (
            <div className="contact-form-feedback contact-form-feedback--error" role="alert">
              <strong>Votre message n’a pas été envoyé.</strong>
              <p>{submission.message}</p>
            </div>
          )}
          <div className="logo-form">
            <Logo className="contact-logo" />
          </div>
        </form>
        </div>

        <div className="contact-sidebar">
          <div className="contact-links-card">

            <a href="mailto:contact@academiesalsabil.fr" className="contact-link email">
              <span className="link-icon"><IconEmail /></span>
              <div className="link-content">
                <span className="link-title">Email</span>
                <p className="link-description">Envoyez-nous un message directement par email.</p>
              </div>
            </a>
            
            <a href="https://wa.me/33123456789" target="_blank" rel="noopener noreferrer" className="contact-link whatsapp">
              <span className="link-icon"><IconWhatsApp /></span>
              <div className="link-content">
                <span className="link-title">WhatsApp</span>
                <p className="link-description">Rapide et pratique pour communiquer avec nos responsables pédagogiques.</p>
              </div>
            </a>

            <a href="https://t.me/academiesalsabil" target="_blank" rel="noopener noreferrer" className="contact-link telegram">
              <span className="link-icon"><IconTelegram /></span>
              <div className="link-content">
                <span className="link-title">Telegram</span>
                <p className="link-description">Pour communiquer avec la direction.</p>
              </div>
            </a>

            <a href="https://instagram.com/academiesalsabil" target="_blank" rel="noopener noreferrer" className="contact-link instagram">
              <span className="link-icon"><IconInstagram /></span>
              <div className="link-content">
                <span className="link-title">Instagram</span>
                <p className="link-description">Suivez notre activité et nos dernières actualités.</p>
              </div>
            </a>

            <button
              type="button"
              className="contact-link faq"
              aria-expanded={isFaqOpen}
              aria-controls="contact-faq"
              onClick={handleFaqToggle}
            >
              <span className="link-icon"><IconFaq /></span>
              <div className="link-content">
                <span className="link-title">FAQ</span>
                <p className="link-description">Retrouvez les réponses à vos questions fréquentes.</p>
              </div>
            </button>

          </div>
        </div>
        </div>
      </section>

      <div
        className={`contact-faq-reveal${isFaqOpen ? ' contact-faq-reveal--open' : ''}`}
        id="contact-faq"
        aria-hidden={!isFaqOpen}
      >
        <div className="contact-faq-reveal__inner">
          <FAQ
            id="faq"
            title="Vos questions, nos réponses"
            introduction="Consultez les informations détaillées sur les cours, les inscriptions, le suivi et l’organisation de l’Académie."
          />
        </div>
      </div>
    </>
  )
}

export default Contact
