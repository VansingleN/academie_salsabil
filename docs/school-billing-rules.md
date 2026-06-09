# Règles de facturation scolaire

Ce document fixe les décisions commerciales utilisées par le moteur
d'échéancier. Les montants actuellement présents dans le catalogue restent des
placeholders.

## Calendrier

Toutes les dates sont centralisées dans `src/data/schoolCalendar.js`.

La configuration provisoire 2026-2027 prévoit :

- une rentrée au 1er septembre 2026 ;
- une fin d'année au 30 juin 2027 ;
- des prélèvements programmés le 7 du mois ;
- une fermeture de l'offre annuelle la veille de la rentrée.

Ces dates devront être remplacées dès que le calendrier définitif sera connu.

## Premier paiement

Le premier paiement est encaissé immédiatement lors de l'inscription. Il
comprend :

- la première période scolaire couverte ;
- les options payantes de cette période ;
- l'intégralité des frais de dossier applicables à l'enfant.

Il ne doit pas être présenté comme un acompte.

## Formule mensuelle

Avant la rentrée :

- dix échéances au total ;
- septembre est encaissé à l'inscription ;
- octobre à juin sont prélevés le 7 de chaque mois.

Après la rentrée, une inscription commence le premier jour du mois suivant.
Exemple : une inscription le 20 janvier couvre d'abord février, puis les
prélèvements reprennent le 7 mars jusqu'au 7 juin.

## Formule trimestrielle

Avant la rentrée :

- le premier trimestre est encaissé à l'inscription ;
- le deuxième trimestre est prélevé le 7 décembre ;
- le troisième trimestre est prélevé le 7 mars.

En cas d'inscription tardive, la période en cours est facturée au prorata des
jours calendaires restants. Les options suivent le même coefficient. Les frais
de dossier ne sont jamais proratisés.

## Formule annuelle

La formule annuelle est disponible jusqu'à la veille de la rentrée. Après cette
date, elle reste visible mais grisée et ne peut plus être ajoutée au panier ou
validée par le serveur.

## Exécution technique des paiements

Stripe Checkout encaisse uniquement le premier paiement calculé par le serveur.
La carte est enregistrée avec le consentement explicite du client afin de
permettre les prélèvements futurs.

Après confirmation du paiement par le webhook signé :

- les formules mensuelles et trimestrielles créent un calendrier Stripe aux
  dates produites par le moteur scolaire ;
- ce calendrier s'arrête automatiquement après la dernière échéance ;
- la formule annuelle ne crée aucun abonnement futur ;
- une erreur de création peut être rejouée sans créer de calendrier en double.

La redirection du navigateur vers la page de succès ne constitue jamais une
preuve de paiement.

## Fiscalité

Les prix du catalogue sont exprimés hors taxes. Le pays de facturation est
obligatoire avant l'ajout au panier.

Le moteur fiscal est actuellement désactivé :

- aucun taux n'est appliqué ;
- aucun total TTC n'est calculé ;
- le pays et la structure fiscale sont néanmoins enregistrés ;
- Stripe devra recalculer la fiscalité définitive après configuration de
  l'entité juridique et de ses immatriculations.

## Impayés et remboursements

La politique prévue pour un paiement refusé est :

1. trois tentatives sur dix jours ;
2. suspension temporaire après échec ;
3. examen humain avant toute résiliation.

Un remboursement exceptionnel est décidé uniquement par le directeur. Lorsqu'il
met fin à la scolarité, les futurs prélèvements doivent être annulés.

Le droit de rétractation suit le délai légal de quatorze jours. Si la famille
demande l'exécution anticipée, elle reste redevable de la part des prestations
effectivement fournies jusqu'à sa demande.
