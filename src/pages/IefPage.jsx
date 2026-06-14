import { Link } from 'react-router-dom'
import houseImage from '../images/house_oilpainting.webp'
import './IefPage.css'

const services = [
  {
    number: '01',
    title: 'Montage du dossier IEF',
    subtitle: 'Présenter un projet familial clair, cohérent et personnalisé.',
    description:
      "Nous accompagnons les familles dans la compréhension des attendus et la structuration de leur demande d'autorisation d'instruction en famille.",
    items: [
      'Analyse de la situation et du projet familial',
      'Organisation des informations et pièces utiles',
      'Aide à la rédaction d’un projet éducatif personnalisé',
      'Relecture et amélioration de la cohérence du dossier'
    ],
    note:
      "L'accompagnement porte sur la préparation du dossier et ne peut garantir la décision de l'administration."
  },
  {
    number: '02',
    title: 'Accompagnement pédagogique',
    subtitle: "Construire un cadre d'apprentissage adapté à la vie familiale.",
    description:
      "Nous aidons les parents à organiser l'année, choisir une progression réaliste et accompagner leur enfant dans les apprentissages du quotidien.",
    items: [
      'Structuration du programme et des objectifs annuels',
      'Planification des apprentissages et des périodes de révision',
      'Suivi pédagogique régulier et ajustements',
      'Soutien dans l’instruction et les matières fondamentales'
    ],
    note:
      "Le parcours est adapté à l'âge, au niveau, aux besoins de l'enfant et au rythme choisi par la famille."
  }
]

function IefPage() {
  return (
    <main className="ief-page">
      <section className="ief-hero">
        <div className="ief-hero-content">
          <Link className="ief-back" to="/">
            Retour à l'accueil
          </Link>
          <span>Instruction en famille</span>
          <h1>Construire un projet IEF serein et structuré</h1>
          <p>
            De la préparation du dossier à l'organisation pédagogique quotidienne,
            l'Académie Salsabil accompagne les familles avec méthode, écoute et clarté.
          </p>
          <Link className="ief-hero-cta" to="/contact">
            Présenter mon projet
          </Link>
        </div>

        <div className="ief-hero-visual">
          <img src={houseImage} alt="Maison familiale illustrant l'instruction en famille" />
        </div>
      </section>

      <section className="ief-services" aria-labelledby="ief-services-title">
        <header>
          <span>Deux formes d'accompagnement</span>
          <h2 id="ief-services-title">Choisissez le soutien dont votre famille a besoin</h2>
          <p>
            Chaque famille peut solliciter un accompagnement ponctuel ou construire un
            suivi plus durable selon l'avancement de son projet.
          </p>
        </header>

        <div className="ief-services-list">
          {services.map((service) => (
            <article className="ief-service" key={service.number}>
              <div className="ief-service-heading">
                <span>{service.number}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.subtitle}</p>
                </div>
              </div>

              <p className="ief-service-description">{service.description}</p>

              <ul>
                {service.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <p className="ief-service-note">{service.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ief-process">
        <div>
          <span>Un premier échange sans engagement</span>
          <h2>Commençons par comprendre votre situation</h2>
        </div>
        <p>
          Nous faisons le point sur votre projet, vos besoins et vos priorités afin de
          vous orienter vers la formule la plus adaptée.
        </p>
        <Link to="/contact">
          Contacter l'équipe
        </Link>
      </section>
    </main>
  )
}

export default IefPage
