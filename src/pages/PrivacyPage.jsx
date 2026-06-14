import { Link } from 'react-router-dom'
import './LegalInformationPage.css'

function PrivacyPage() {
  return (
    <main className="legal-information-page">
      <header className="legal-information-page__header">
        <span>Protection des données</span>
        <h1>Politique de confidentialité</h1>
        <p>
          Cette page explique quelles données sont utilisées par l’Académie
          Salsabil, pourquoi elles sont nécessaires et pendant combien de temps
          elles sont conservées.
        </p>
      </header>

      <div className="legal-information-page__content">
        <aside className="legal-information-page__notice">
          Version de travail du 14 juin 2026. L’identité juridique et l’adresse
          du responsable de traitement doivent être complétées avant la mise en
          production.
        </aside>

        <section>
          <h2>1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement est l’entité qui exploite l’Académie
            Salsabil.
          </p>
          <dl>
            <div>
              <dt>Identité juridique</dt>
              <dd>À compléter avant publication</dd>
            </div>
            <div>
              <dt>Adresse</dt>
              <dd>À compléter avant publication</dd>
            </div>
            <div>
              <dt>Contact relatif aux données</dt>
              <dd>
                <a href="mailto:contact@academiesalsabil.fr">
                  contact@academiesalsabil.fr
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2>2. Données collectées et finalités</h2>
          <h3>Messages et demandes de soutien</h3>
          <p>
            Les coordonnées, informations sur le besoin scolaire et disponibilités
            sont utilisées uniquement pour répondre à la demande, proposer un
            accompagnement et assurer son suivi.
          </p>
          <h3>Inscriptions et commandes</h3>
          <p>
            Les coordonnées du responsable légal, l’adresse de facturation et les
            informations nécessaires concernant l’élève servent à préparer et
            exécuter la prestation, organiser les groupes, assurer le suivi
            pédagogique et respecter les obligations comptables.
          </p>
          <h3>Données techniques</h3>
          <p>
            Une empreinte non réversible de l’adresse IP peut être utilisée
            temporairement pour limiter les soumissions abusives. L’adresse IP
            complète n’est pas enregistrée dans le stockage anti-spam du site.
          </p>
        </section>

        <section>
          <h2>3. Bases légales</h2>
          <ul>
            <li>
              les démarches précontractuelles demandées par la famille pour les
              demandes de renseignement et de créneau ;
            </li>
            <li>
              l’exécution du contrat pour les inscriptions et prestations ;
            </li>
            <li>
              le respect des obligations légales pour la facturation et la
              comptabilité ;
            </li>
            <li>
              l’intérêt légitime de sécuriser les formulaires et prévenir les abus.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Destinataires et prestataires</h2>
          <p>
            Les données sont accessibles uniquement aux personnes habilitées de
            l’Académie Salsabil et, dans la limite de leurs missions, aux prestataires
            techniques nécessaires :
          </p>
          <ul>
            <li>Netlify pour l’hébergement, les fonctions serveur et le stockage ;</li>
            <li>Stripe pour les paiements, lors de son activation en production ;</li>
            <li>Brevo pour les notifications e-mail, lors de leur activation.</li>
          </ul>
          <p>
            Les informations pédagogiques détaillées ne sont pas copiées dans les
            métadonnées Stripe.
          </p>
        </section>

        <section>
          <h2>5. Durées de conservation</h2>
          <ul>
            <li>
              demandes et messages ouverts : 12 mois après leur création ;
            </li>
            <li>
              demandes et messages clôturés : 6 mois après leur dernière mise à
              jour ;
            </li>
            <li>
              préavis 30 jours avant l’échéance, puis suppression 30 jours après ;
            </li>
            <li>
              données pédagogiques d’inscription : revue 12 mois après la fin de la
              prestation ;
            </li>
            <li>
              documents commerciaux utiles à la preuve : jusqu’à 5 ans selon leur
              finalité ;
            </li>
            <li>
              pièces comptables obligatoires : 10 ans à compter de la clôture de
              l’exercice concerné.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Vos droits</h2>
          <p>
            Vous pouvez demander l’accès, la rectification, l’effacement ou la
            limitation de vos données, ainsi que vous opposer à certains traitements
            lorsque la réglementation le permet. Une preuve d’identité peut être
            demandée uniquement en cas de doute raisonnable.
          </p>
          <p>
            Adressez votre demande à{' '}
            <a href="mailto:contact@academiesalsabil.fr">
              contact@academiesalsabil.fr
            </a>
            . Vous pouvez également introduire une réclamation auprès de la{' '}
            <a href="https://www.cnil.fr/" target="_blank" rel="noreferrer">
              CNIL
            </a>
            .
          </p>
        </section>

        <section>
          <h2>7. Traceurs et stockage local</h2>
          <p>
            Le site n’utilise actuellement aucun outil publicitaire ou analytique
            nécessitant un consentement. Le panier et la clé temporaire de
            l’administration utilisent le stockage du navigateur pour assurer leur
            fonctionnement. Cette section devra être mise à jour avant l’ajout de
            nouveaux traceurs.
          </p>
        </section>

        <section>
          <h2>8. Mise à jour de cette politique</h2>
          <p>
            Cette politique pourra évoluer avec les services et prestataires du
            site. La version applicable sera identifiée par sa date de mise à jour.
          </p>
          <p>
            Consultez également les <Link to="/mentions-legales">mentions légales</Link>{' '}
            et les{' '}
            <Link to="/conditions-generales-de-vente">
              conditions générales de vente
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  )
}

export default PrivacyPage
