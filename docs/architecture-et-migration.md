# Architecture, dépendances Netlify et migration

Ce document décrit les éléments à conserver, remplacer et reconfigurer si
l'Académie Salsabil quitte Netlify. Il doit être mis à jour lors de tout ajout
de stockage, de Function ou de service externe.

## Vue d'ensemble

Le projet est séparé en trois couches :

1. le frontend React/Vite ;
2. la logique métier dans `src/server` ;
3. les adaptateurs propres à l'hébergement dans `netlify/functions` et les
   repositories Netlify Blobs.

Le frontend et l'essentiel de la logique métier sont portables. La migration
concerne principalement les endpoints HTTP, le stockage et la configuration des
services externes.

## Dépendances directes à Netlify

### Déploiement et routage

- `netlify.toml` configure le build, les Functions, les en-têtes, les routes API
  et le fallback de `BrowserRouter`.
- `netlify/functions/*.mjs` adapte les requêtes HTTP Netlify aux services de
  `src/server`.
- La variable Netlify `URL` fournit l'origine publique utilisée pour les
  redirections Stripe.

### Stockage Netlify Blobs

Deux magasins sont utilisés :

| Magasin | Fichier | Contenu |
| --- | --- | --- |
| `academie-salsabil-orders` | `src/server/orderRepository.js` | commandes, index Stripe, événements traités et reçus d'e-mails |
| `academie-salsabil-support-requests` | `src/server/supportRequestRepository.js` | demandes de soutien et statuts de suivi |
| `academie-salsabil-contact-messages` | `src/server/contactMessageRepository.js` | messages du formulaire de contact et statuts |
| `academie-salsabil-form-security` | `src/server/formSubmissionProtectionRepository.js` | compteurs anti-spam par empreinte IP et fenêtre de temps |

Clés du magasin des commandes :

- `orders/{orderId}.json`
- `checkout-sessions/{sessionId}.json`
- `subscriptions/{subscriptionId}.json`
- `stripe-events/{eventId}.json`
- `email-deliveries/{deliveryId}.json`

Clés du magasin des demandes :

- `requests/{requestId}.json`

Clés du magasin des messages de contact :

- `messages/{messageId}.json`

Clés du magasin de protection des formulaires :

- `attempts/{empreinteIp}/{fenetreDeTemps}/{attemptId}.json`

L'adresse IP n'est pas enregistrée en clair. Une empreinte SHA-256 sert
uniquement à compter les tentatives dans une fenêtre de quinze minutes.

Les documents `orders/*` et `requests/*` contiennent des données personnelles.
Leur export, leur transfert et leur suppression doivent respecter la politique
de confidentialité et les durées de conservation adoptées par l'académie.

Les notifications des formulaires passent par `src/server/formNotification.js`.
Elles utilisent le même adaptateur Brevo que les e-mails transactionnels, mais
disposent d'un interrupteur indépendant `FORM_NOTIFICATION_MODE`. Une panne
d'e-mail ne remet jamais en cause l'enregistrement de la demande.

## Routes serveur actuelles

| Route publique | Adaptateur Netlify | Responsabilité |
| --- | --- | --- |
| `POST /api/cart-quote` | `validate-cart.mjs` | validation et calcul du panier |
| `POST /api/create-checkout-session` | `create-checkout-session.mjs` | création de Stripe Checkout |
| `POST /api/stripe-webhook` | `stripe-webhook.mjs` | traitement signé et idempotent des événements Stripe |
| `POST /api/verify-checkout-session` | `verify-checkout-session.mjs` | confirmation serveur après paiement |
| `POST /api/create-customer-portal` | `create-customer-portal.mjs` | ouverture du portail Stripe |
| `POST/GET/PATCH/DELETE /api/support-requests` | `create-support-request.mjs` | création et administration des demandes de soutien |
| `POST/GET/PATCH/DELETE /api/contact-messages` | `contact-messages.mjs` | création et administration des messages de contact |
| `GET /api/admin-orders` | `admin-orders.mjs` | consultation privée et paginée des commandes |

La Function planifiée `data-retention-cleanup.mjs` applique quotidiennement la
politique décrite dans `docs/data-retention-policy.md`. Elle supprime uniquement
les demandes de soutien et messages de contact arrivés à échéance. Les commandes
et dossiers d'inscription restent exclus de toute suppression automatique.

Sur un autre hébergeur, ces contrats HTTP doivent être conservés autant que
possible. Les fichiers `src/utils/*Api.js` du frontend pourront alors continuer
à fonctionner sans modification, ou avec un simple changement d'URL de base.

## Éléments directement portables

- toutes les pages et tous les composants React ;
- `src/data`, notamment le catalogue, les tarifs et le calendrier ;
- la validation et les calculs de `src/server` ;
- la logique Stripe, l'échéancier et les modèles d'e-mails ;
- les tests dans `scripts` ;
- les interfaces des repositories mémoire et leurs méthodes métier.

Les services ne doivent pas importer directement un SDK propre au futur
fournisseur. Le SDK de stockage doit rester isolé dans une nouvelle
implémentation de repository.

## Repositories à réimplémenter

### Commandes

Une future implémentation PostgreSQL, Supabase ou équivalente doit fournir les
méthodes actuellement exposées par `createNetlifyBlobsOrderRepository` :

- `saveOrder`
- `getOrder`
- `findOrderByCheckoutSession`
- `findOrderBySubscription`
- `getProcessedEvent`
- `saveProcessedEvent`
- `claimEmailDelivery`
- `getEmailDelivery`
- `saveEmailDelivery`

Les identifiants Stripe et les identifiants de livraison doivent être uniques.
`claimEmailDelivery` doit conserver un comportement atomique afin d'empêcher
les doubles notifications lors des rejeux de webhook.

### Demandes de soutien

La future implémentation doit fournir :

- `save`
- `get`
- `list`
- `update`
- `delete`

Les mises à jour concurrentes doivent rester protégées. Netlify utilise
actuellement un contrôle par `etag` ; une base SQL pourra utiliser une
transaction ou une colonne de version.

## Variables d'environnement

Les noms de référence sont conservés dans `.env.example` :

- secrets Stripe et activation du portail ;
- configuration Brevo et e-mails transactionnels ;
- clé d'accès au tableau des demandes de soutien.

Lors d'une migration, les valeurs doivent être recréées dans le gestionnaire de
secrets du nouvel hébergeur. Elles ne doivent pas être copiées dans Git, dans le
frontend ou dans une image de conteneur publique.

Le nouvel environnement doit également fournir une URL publique fiable en
remplacement de `process.env.URL`, ou les adaptateurs devront utiliser une
variable explicite comme `SITE_URL`.

## Services externes à reconfigurer

### Stripe

1. Déployer le nouvel endpoint `/api/stripe-webhook`.
2. Créer ou modifier l'endpoint dans Stripe Dashboard.
3. Enregistrer le nouveau `STRIPE_WEBHOOK_SECRET`.
4. Vérifier les URL de succès, d'annulation et du portail.
5. Rejouer les tests de paiement, d'idempotence et d'échéancier.
6. Conserver l'ancien endpoint actif pendant la courte période de bascule si
   des événements sont encore en attente.

### Brevo

Le fournisseur est déjà isolé dans `src/server/brevoEmailProvider.js`. Il faut
recréer les mêmes variables secrètes sur le nouvel hébergeur et vérifier que le
domaine, l'expéditeur, DKIM et DMARC restent valides.

### DNS et domaine

Préparer les enregistrements DNS avec un TTL réduit avant la bascule. Le domaine
doit être dirigé vers le nouvel hébergeur seulement après validation du build,
des fonctions, des paiements et des formulaires sur une URL de recette.

## Export et import des données

Le tableau administratif permet d'exporter séparément les demandes de soutien,
les messages de contact et les commandes en JSON ou CSV. La route
`/api/admin-export` utilise la même clé secrète que le tableau, désactive le
cache HTTP et protège les cellules CSV contre l'interprétation de formules.

Le JSON conserve la structure complète pour une sauvegarde ou une migration.
Le CSV fournit une vue aplatie adaptée au suivi courant. Ces fichiers
contiennent des données personnelles : ils doivent être conservés dans un
emplacement protégé puis supprimés selon la politique de conservation.

Les routes administratives utilisent une comparaison de clé résistante aux
attaques temporelles. Six clés incorrectes depuis une même adresse IP dans une
fenêtre de 15 minutes déclenchent un blocage temporaire. Les accès réussis ne
sont pas comptabilisés.

L'export doit :

1. exporter les trois catégories depuis le tableau administratif ;
2. conserver les identifiants, références, dates et statuts sans transformation
   destructive ;
3. chiffrer l'archive ou la conserver dans un emplacement privé ;
4. produire un décompte par type de document ;
5. importer d'abord dans un environnement de recette ;
6. vérifier les relations entre commandes, sessions, abonnements et événements ;
7. comparer les décomptes et quelques enregistrements échantillons ;
8. supprimer les archives temporaires après validation.

Le dernier export doit être réalisé pendant une fenêtre où les nouvelles
écritures sont bloquées ou répliquées, afin de ne perdre aucune commande ni
demande.

## Procédure de migration recommandée

1. Choisir l'hébergeur et la base de données cible.
2. Créer les nouveaux repositories sans supprimer ceux de Netlify.
3. Adapter les six routes HTTP au framework cible.
4. Recréer les variables d'environnement.
5. Créer et tester l'outil d'export/import.
6. Déployer un environnement de recette.
7. Exécuter lint, build et tous les tests métier.
8. Tester formulaire, tableau administratif, panier, Stripe et e-mails.
9. Réaliser un export final des données.
10. Importer et comparer les données.
11. Reconfigurer Stripe et le domaine.
12. Surveiller les erreurs et conserver Netlify en lecture ou en secours pendant
    une période courte.

## Validation après bascule

- accès direct à toutes les routes React sans erreur 404 ;
- devis serveur identique aux montants affichés ;
- création et confirmation d'un paiement test ;
- webhook Stripe reçu une seule fois fonctionnellement ;
- échéancier et portail client valides ;
- demande de soutien créée puis visible dans l'administration ;
- changement de statut et suppression d'une demande ;
- e-mails de test reçus sans doublon ;
- canonical, sitemap, robots et Open Graph utilisant le domaine définitif ;
- sauvegarde, restauration et suppression des données testées.

## Retour arrière

Tant que la migration n'est pas validée :

- ne pas supprimer les magasins Netlify Blobs ;
- conserver le dernier déploiement Netlify opérationnel ;
- conserver les anciennes variables secrètes ;
- documenter l'instant du dernier export ;
- prévoir la remise en place du DNS et de l'ancien webhook Stripe.

Le retour arrière doit éviter les écritures simultanées dans deux bases. Si le
nouveau site a déjà reçu des commandes, celles-ci doivent être exportées avant
de réactiver définitivement l'ancien environnement.
