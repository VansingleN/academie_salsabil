# Académie Salsabil

Site de présentation et d'inscription de l'Académie Salsabil, développé avec
React et Vite.

## État du projet

La plateforme comprend actuellement :

- les cursus de la maternelle au lycée ;
- les programmes et formules tarifaires par classe ;
- les options de langue et leurs suppléments ;
- un panier invité persistant et modifiable ;
- un catalogue tarifaire centralisé ;
- une validation sécurisée du panier avec Netlify Functions ;
- Stripe Checkout hébergé en mode test ;
- un stockage temporaire des commandes avec Netlify Blobs ;
- un webhook Stripe signé et idempotent ;
- un Checkout limité au premier paiement calculé par le serveur ;
- des calendriers Stripe mensuels et trimestriels créés après le webhook ;
- une vérification serveur de la page de succès ;
- un portail client Stripe préparé, mais désactivé par défaut ;
- un calendrier scolaire configurable et un moteur d'échéancier ;
- la gestion des inscriptions tardives et du prorata trimestriel ;
- un pays de facturation obligatoire avant l'ajout au panier.

## Changelog du prochain déploiement

### Panier invité

- Création d'une page panier complète.
- Ajout d'un compteur dynamique dans la barre de navigation.
- Modification des classes, formules, créneaux et langues depuis le panier.
- Suppression individuelle des inscriptions et vidage complet du panier.
- Persistance des inscriptions dans le stockage local.
- Migration automatique des anciens articles enregistrés.

### Catalogue et tarification

- Centralisation des cursus, classes, formules, options et tarifs.
- Remplacement des montants enregistrés dans le navigateur par des identifiants
  d'offres.
- Recalcul systématique des tarifs et suppléments depuis le catalogue.
- Préparation des paiements uniques, échéances scolaires et frais de dossier.
- Ajout de l'option payante de langue arabe du CP au CM2 et en 6e.

### Sécurité du paiement

- Création d'une Netlify Function de validation du panier.
- Refus des offres, options et valeurs inconnues.
- Protection contre l'injection de prix depuis le navigateur.
- Vérification côté serveur des contraintes LV2 et LV3.
- Affichage de l'état « Tarifs vérifiés par le serveur » dans le panier.
- Ajout de tests automatisés pour les principaux scénarios de sécurité.
- Création sécurisée des sessions Stripe Checkout en mode test.
- Protection empêchant l'utilisation accidentelle d'une clé Stripe live.
- Vérification HMAC du corps brut des webhooks Stripe.
- Détection et neutralisation des événements Stripe déjà traités.
- Confirmation des commandes exclusivement depuis l'état écrit par le webhook.
- Préparation du portail client derrière une activation serveur explicite.
- Encaissement dans Checkout du seul premier paiement validé par le serveur.
- Enregistrement consenti de la carte pour les prélèvements hors session.
- Création idempotente des calendriers Stripe mensuels et trimestriels après
  confirmation du webhook.
- Arrêt automatique après la dernière échéance et absence de calendrier futur
  pour la formule annuelle.
- Génération des dix échéances mensuelles et des trois échéances trimestrielles.
- Facturation des frais de dossier avec le premier paiement.
- Fermeture automatique de l'offre annuelle après la veille de la rentrée.
- Préparation d'une fiscalité configurable, actuellement désactivée.

### Déploiement

- Préparation du projet pour Netlify.
- Conservation temporaire de la compatibilité avec GitHub Pages.
- Ajout d'une route locale Vite utilisant le même moteur de devis que Netlify.
- Protection des futures variables d'environnement et clés Stripe.

### Documentation

- Commentaires ajoutés dans les composants et services importants.
- Documentation de l'architecture du paiement et du futur raccordement à Stripe.
- Mise en place d'un changelog maintenu à chaque évolution importante.

## Vérifications disponibles

```bash
npm run lint
npm run build
npm run test:quote
npm run test:checkout
npm run test:stripe-schedule
npm run test:webhook
npm run test:session
npm run test:schedule
```

Le détail historique des changements reste disponible dans
[CHANGELOG.md](./CHANGELOG.md). L'architecture du paiement est décrite dans
[docs/payment-architecture.md](./docs/payment-architecture.md).
Les règles commerciales validées sont consignées dans
[docs/school-billing-rules.md](./docs/school-billing-rules.md).
