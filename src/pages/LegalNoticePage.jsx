import { Link } from 'react-router-dom'
import './LegalInformationPage.css'

function LegalNoticePage() {
  return (
    <main className="legal-information-page">
      <header className="legal-information-page__header">
        <span>Informations de l’éditeur</span>
        <h1>Mentions légales</h1>
        <p>
          Informations relatives à l’édition, l’hébergement et l’utilisation du
          site de l’Académie Salsabil.
        </p>
      </header>

      <div className="legal-information-page__content">
        <aside className="legal-information-page__notice">
          Cette structure est prête, mais les champs signalés doivent être
          remplacés par les informations officielles de l’entreprise avant
          publication.
        </aside>

        <section>
          <h2>1. Éditeur du site</h2>
          <dl>
            <div>
              <dt>Nom commercial</dt>
              <dd>Académie Salsabil</dd>
            </div>
            <div>
              <dt>Nom, dénomination sociale et forme juridique</dt>
              <dd>À compléter avant publication</dd>
            </div>
            <div>
              <dt>Adresse du siège ou de l’établissement</dt>
              <dd>À compléter avant publication</dd>
            </div>
            <div>
              <dt>Immatriculation SIREN, SIRET ou RCS</dt>
              <dd>À compléter avant publication</dd>
            </div>
            <div>
              <dt>Numéro de TVA intracommunautaire</dt>
              <dd>À compléter si applicable</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>
                <a href="mailto:contact@academiesalsabil.fr">
                  contact@academiesalsabil.fr
                </a>
              </dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd><a href="tel:+33123456789">+33 1 23 45 67 89</a></dd>
            </div>
          </dl>
        </section>

        <section>
          <h2>2. Direction de la publication</h2>
          <p>
            Nom et qualité du directeur ou de la directrice de publication :
            <strong> à compléter avant publication</strong>.
          </p>
        </section>

        <section>
          <h2>3. Hébergement</h2>
          <p>
            Le site est actuellement hébergé par Netlify, Inc. Les coordonnées
            exactes de l’entité contractante et du support devront être reprises
            depuis le contrat ou le tableau de bord Netlify au moment du lancement.
          </p>
          <p>
            Site de l’hébergeur :{' '}
            <a href="https://www.netlify.com/" target="_blank" rel="noreferrer">
              www.netlify.com
            </a>
          </p>
        </section>

        <section>
          <h2>4. Propriété intellectuelle</h2>
          <p>
            Sauf mention contraire, les textes, éléments graphiques, marques,
            logos et contenus présents sur ce site sont protégés. Leur reproduction,
            représentation ou adaptation sans autorisation préalable est interdite,
            hors exceptions prévues par la loi.
          </p>
        </section>

        <section>
          <h2>5. Responsabilité</h2>
          <p>
            L’Académie Salsabil veille à fournir des informations accessibles et à
            jour. Les contenus généraux du site ne remplacent pas un échange adapté
            à la situation pédagogique de chaque élève. Les liens externes sont
            fournis à titre pratique et leur contenu reste sous la responsabilité
            de leurs éditeurs.
          </p>
        </section>

        <section>
          <h2>6. Données personnelles</h2>
          <p>
            Les règles relatives aux formulaires, inscriptions, paiements et droits
            des personnes sont détaillées dans la{' '}
            <Link to="/politique-de-confidentialite">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  )
}

export default LegalNoticePage
