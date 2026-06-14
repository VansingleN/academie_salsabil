# Politique technique de conservation des données

Version : 14 juin 2026

Cette politique décrit les règles appliquées au stockage technique du site.
Elle devra être alignée avec les mentions d'information, la politique de
confidentialité et les documents contractuels définitifs avant la mise en
production.

## Principes

- Les données restent accessibles en base active uniquement pendant la durée
  nécessaire au traitement du besoin.
- Un préavis technique commence 30 jours avant l'échéance. La suppression
  intervient au plus tôt 30 jours après l'échéance.
- Les suppressions automatiques ne concernent jamais une commande ou une preuve
  de paiement.
- Une suppression manuelle reste disponible pour les demandes et messages dans
  l'espace d'administration.
- Toute demande d'effacement doit faire l'objet d'une vérification préalable :
  certaines preuves contractuelles ou comptables peuvent devoir être conservées.

## Durées retenues

| Catégorie | Base active | Sort final | Mode |
| --- | --- | --- | --- |
| Demande de soutien ouverte | 12 mois après sa création | Préavis 30 jours avant, suppression 30 jours après | Automatique et manuelle |
| Demande de soutien clôturée | 6 mois après sa dernière mise à jour | Préavis 30 jours avant, suppression 30 jours après | Automatique et manuelle |
| Message de contact ouvert | 12 mois après sa création | Préavis 30 jours avant, suppression 30 jours après | Automatique et manuelle |
| Message de contact clôturé | 6 mois après sa dernière mise à jour | Préavis 30 jours avant, suppression 30 jours après | Automatique et manuelle |
| Données pédagogiques d'inscription | Durée de la prestation puis revue à 12 mois | Suppression ou anonymisation après validation | Manuelle |
| Preuves contractuelles et correspondance commerciale | Jusqu'à 5 ans selon leur finalité | Suppression ou archivage comptable minimal | Manuelle |
| Pièces et données strictement comptables | 10 ans à compter de la clôture de l'exercice concerné | Suppression à échéance légale | Manuelle |

Les informations pédagogiques comprennent notamment les objectifs, besoins,
aménagements, niveaux linguistiques et niveaux de mémorisation. Elles ne doivent
pas être conservées dans l'archive comptable lorsqu'elles ne sont plus utiles.

## Automatisation

La Function `data-retention-cleanup` s'exécute quotidiennement à minuit UTC sur
les déploiements Netlify publiés. Elle :

1. parcourt les demandes de soutien ;
2. parcourt les messages de contact ;
3. calcule leur échéance selon le statut ;
4. marque les éléments entrant dans leur période de préavis ;
5. affiche leur date de suppression dans l'espace d'administration ;
6. supprime uniquement les éléments dont le délai de grâce est terminé ;
7. écrit dans les logs Netlify un bilan sans contenu personnel.

Un ancien élément déjà arrivé à échéance lors de sa première détection n'est
jamais supprimé immédiatement. Il reçoit un préavis complet de 30 jours à
compter de cette détection.

Les commandes et dossiers d'inscription sont explicitement exclus de cette
purge automatique.

En local, Netlify Dev ne lance pas la planification. La Function peut être
déclenchée avec la commande suivante :

```bash
npx netlify functions:invoke data-retention-cleanup
```

## Revue des dossiers d'inscription

Avant d'automatiser l'anonymisation des dossiers, les conditions suivantes
doivent être réunies :

1. chaque offre fournit une date de fin de prestation fiable ;
2. la structure juridique et les obligations comptables sont confirmées ;
3. les champs nécessaires à la facture et à la preuve contractuelle sont
   séparés des données pédagogiques ;
4. une restauration depuis sauvegarde a été testée ;
5. l'action est journalisée sans recopier les données personnelles.

La future opération devra supprimer les données pédagogiques tout en conservant
dans une archive à accès restreint les références de commande, montants,
informations fiscales, consentements et justificatifs indispensables.
