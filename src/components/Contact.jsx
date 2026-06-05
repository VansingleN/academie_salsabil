import { useState } from 'react'
import './Contact.css'
import Logo from './Logo'
import {
  IconEmail,
  IconWhatsApp,
  IconTelegram,
  IconInstagram,
  IconFaq,
} from './ContactIcons'

function Contact() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      message: ''
    })
  }

  return (
    <section className="contact">
      <div className="contact-container">
        <div className="contact-form-column">
        <h2 className="form-title">Formulaire de contact</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
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

          <button type="submit" className="contact-button">Envoyer</button>
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

            <button type="button" className="contact-link faq">
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
  )
}

export default Contact
