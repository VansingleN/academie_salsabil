import { Link } from 'react-router-dom'
import EducationalValues from '../components/EducationalValues'
import Method from '../components/Method'
import './AboutPage.css'

function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-page__hero" aria-labelledby="about-page-title">
        <div>
          <span>À propos de l’Académie</span>
          <h1 id="about-page-title">Une pédagogie attentive, structurée et proche des familles</h1>
          <p>
            Notre approche associe des objectifs clairs, un accompagnement adapté à
            chaque élève et un dialogue régulier avec les familles.
          </p>
          <Link to="/contact">Échanger avec notre équipe</Link>
        </div>
      </section>

      <Method />
      <EducationalValues />
    </main>
  )
}

export default AboutPage
