import './TermsPage.css'

function TermsPage() {
  return (
    <main className="terms-page">
      <header className="terms-page__header">
        <span>Informations contractuelles</span>
        <h1>Conditions générales de vente</h1>
        <p>
          Version de travail à compléter avec les informations juridiques de
          l’Académie Salsabil avant publication définitive.
        </p>
      </header>

      <div className="terms-page__content">
        <section>
          <h2>1. Objet et champ d’application</h2>
          <p>
            Les présentes conditions encadrent les prestations d’accompagnement
            éducatif proposées par l’Académie Salsabil, notamment les offres Summer
            Camp personnalisées ou organisées en petits groupes.
          </p>
          <p>
            Les caractéristiques essentielles, la durée, le rythme et le tarif de
            chaque prestation sont présentés avant la validation de la commande.
          </p>
        </section>

        <section>
          <h2>2. Prix et paiement</h2>
          <p>
            Les prix affichés sur le site sont indiqués hors taxes. Le montant
            applicable est celui récapitulé avant le paiement. Pour les ateliers
            personnalisés, le prix de la prestation est réglé selon les modalités
            indiquées au moment de la commande.
          </p>
          <p>
            Pour les ateliers groupés, le premier règlement constitue un acompte de
            pré-réservation. Cet acompte est déduit du prix final de la prestation.
          </p>
        </section>

        <section>
          <h2>3. Constitution des groupes Summer Camp</h2>
          <p>
            Les ateliers groupés sont confirmés à partir de deux élèves et limités à
            six élèves. Le versement de l’acompte réserve une demande de place, mais
            ne vaut pas confirmation définitive du groupe.
          </p>
          <p>
            Si aucun groupe adapté ne peut être constitué sur le créneau choisi,
            l’acompte est intégralement remboursé ou reporté sur un autre créneau,
            selon le choix de la famille.
          </p>
        </section>

        <section>
          <h2>4. Confirmation et règlement du solde</h2>
          <p>
            Après confirmation du groupe, le solde est demandé par lien de paiement
            sécurisé. Il doit être réglé sous 72 heures. Un rappel est envoyé après
            48 heures.
          </p>
          <p>
            La place est définitivement validée après règlement du solde. Sans
            règlement dans le délai indiqué, elle pourra être proposée à une autre
            famille.
          </p>
          <p>
            L’acompte n’est pas automatiquement perdu : il peut être reporté sur un
            autre créneau disponible ou transformé en avoir. Il n’est conservé
            définitivement qu’en cas d’annulation tardive claire par la famille ou
            d’absence de réponse après plusieurs relances.
          </p>
        </section>

        <section>
          <h2>5. Modification de créneau et annulation</h2>
          <p>
            Un changement de créneau peut être demandé jusqu’à sept jours avant le
            début de l’accompagnement, sous réserve des places disponibles.
          </p>
          <p>
            En cas d’annulation par la famille après le délai légal de rétractation,
            l’acompte peut rester acquis afin de couvrir la réservation de la place
            et l’organisation du groupe, conformément aux conditions communiquées
            lors de la commande.
          </p>
        </section>

        <section>
          <h2>6. Droit de rétractation</h2>
          <p>
            Les modalités et le délai légal de rétractation applicables seront
            précisés ici en fonction de la nature exacte des prestations, de leur
            date de commencement et des informations juridiques de l’Académie.
          </p>
        </section>

        <aside>
          Cette version doit être relue et complétée avant mise en production,
          notamment pour l’identité du vendeur, la fiscalité, la médiation, les
          responsabilités et le droit applicable.
        </aside>
      </div>
    </main>
  )
}

export default TermsPage
