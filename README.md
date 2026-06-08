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
- une architecture préparée pour Stripe Checkout et les abonnements.

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
- Préparation des paiements uniques, abonnements, échéances, acomptes et frais
  de dossier.
- Ajout de l'option payante de langue arabe du CP au CM2 et en 6e.

### Sécurité du paiement

- Création d'une Netlify Function de validation du panier.
- Refus des offres, options et valeurs inconnues.
- Protection contre l'injection de prix depuis le navigateur.
- Vérification côté serveur des contraintes LV2 et LV3.
- Affichage de l'état « Tarifs vérifiés par le serveur » dans le panier.
- Ajout de tests automatisés pour les principaux scénarios de sécurité.

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
```

Le détail historique des changements reste disponible dans
[CHANGELOG.md](./CHANGELOG.md). L'architecture du paiement est décrite dans
[docs/payment-architecture.md](./docs/payment-architecture.md).
