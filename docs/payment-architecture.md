# Architecture du paiement

## Principe de sécurité

Le navigateur ne confirme jamais une commande. La redirection vers
`/paiement/succes` indique seulement que Stripe a renvoyé l'utilisateur sur le
site. La confirmation réelle provient d'un webhook Stripe signé, traité côté
serveur et enregistré dans le stockage des commandes.

## Devis serveur

Le navigateur conserve uniquement :

- `cartItemId` : identifiant de la ligne de panier ;
- `offerId` : cursus, classe et formule ;
- `selections` : créneau et options choisies.

Il ne transmet aucun prix à la route `/api/cart-quote`.

La Netlify Function :

1. vérifie la forme du panier et limite sa taille ;
2. refuse les offres, champs et valeurs inconnus ;
3. applique les contraintes de langues ;
4. recharge tous les tarifs depuis `src/data/offerCatalog.js` ;
5. calcule les suppléments et les totaux ;
6. renvoie un devis non mis en cache.

Le devis génère désormais également un échéancier scolaire complet. Il sépare :

- le premier paiement encaissé à l'inscription ;
- les échéances futures et leurs dates ;
- les périodes pédagogiques couvertes ;
- les frais de dossier facturés uniquement au premier paiement ;
- le prorata journalier des inscriptions trimestrielles tardives ;
- la structure fiscale encore désactivée.

Le calendrier est configuré dans `src/data/schoolCalendar.js` et les règles
commerciales sont détaillées dans `docs/school-billing-rules.md`.

## Dossier d'inscription

Avant l'ouverture de Stripe Checkout, le client complète un dossier structuré :

- un responsable légal et ses coordonnées ;
- une adresse de facturation cohérente avec le pays du devis ;
- une fiche pédagogique par ligne du panier et donc par enfant ;
- trois consentements explicites : CGV, échéancier et enregistrement du moyen
  de paiement.

Les champs et versions affichés sont centralisés dans
`src/data/enrollmentProfile.js`. Le navigateur ne conserve pas ces informations
personnelles dans `localStorage`.

`src/server/enrollmentProfile.js` valide ensuite le dossier indépendamment du
front :

1. les champs inconnus et les objets mal formés sont refusés ;
2. les textes sont nettoyés et limités en taille ;
3. l'e-mail, le téléphone, la date de naissance et les valeurs contrôlées sont
   vérifiés ;
4. chaque `cartItemId` doit posséder exactement une fiche élève ;
5. le pays de l'adresse doit correspondre au pays du devis ;
6. les versions de consentement doivent être les versions courantes ;
7. l'horodatage d'acceptation est généré par le serveur.

Le dossier assaini est enregistré dans la commande. Les noms, coordonnées,
adresses, dates de naissance et informations pédagogiques ne sont jamais copiés
dans les métadonnées Stripe. Stripe reçoit uniquement les références techniques
de commande, d'offre et d'échéancier.

La politique technique de conservation et de suppression est définie dans
`docs/data-retention-policy.md`. Les commandes restent exclues de la purge
automatique : les données pédagogiques feront l'objet d'une revue manuelle,
tandis que les preuves contractuelles et comptables seront conservées selon
leurs obligations propres. Netlify Blobs reste ici un stockage serveur
transitoire, pas un système d'archivage légal définitif.

## Fichiers importants

- `src/data/offerCatalog.js` : catalogue commercial partagé ;
- `src/data/enrollmentProfile.js` : champs et versions de consentement ;
- `src/server/cartQuote.js` : validation et calcul côté serveur ;
- `src/server/enrollmentProfile.js` : validation et assainissement du dossier ;
- `netlify/functions/validate-cart.mjs` : adaptateur HTTP Netlify ;
- `vite.cart-quote-plugin.js` : équivalent local pour le développement ;
- `src/utils/cartQuoteApi.js` : appel du front vers le serveur ;
- `scripts/test-cart-quote.mjs` : tests de sécurité essentiels.
- `src/data/schoolCalendar.js` : calendrier configurable de l'année scolaire ;
- `src/data/taxPolicy.js` : activation future du calcul fiscal ;
- `src/server/paymentSchedule.js` : génération des échéances et proratas ;
- `scripts/test-payment-schedule.mjs` : tests du calendrier scolaire.
- `src/server/orderRepository.js` : interface du stockage des commandes ;
- `src/server/stripeWebhook.js` : signature et traitement idempotent ;
- `src/server/stripeSubscriptionSchedule.js` : création des échéances Stripe futures ;
- `src/server/stripeSession.js` : vérification des sessions et portail client ;
- `netlify/functions/stripe-webhook.mjs` : endpoint webhook public ;
- `netlify/functions/verify-checkout-session.mjs` : contrôle de la page succès ;
- `netlify/functions/create-customer-portal.mjs` : création sécurisée du portail.
- `scripts/test-stripe-subscription-schedule.mjs` : tests des calendriers Stripe.
- `scripts/test-enrollment-profile.mjs` : tests des données personnelles et
  consentements.

## Stripe Checkout en mode test

Le catalogue reste visible dans le JavaScript du navigateur afin d'afficher les
formules rapidement. Cela n'est pas une faille : le futur paiement utilisera
uniquement le devis recalculé par la fonction serveur.

La fonction déclare elle-même le chemin public `/api/cart-quote`. La redirection
présente dans `netlify.toml` reste une compatibilité supplémentaire, mais le
fonctionnement du panier ne dépend plus d'elle seule.

La route `/api/create-checkout-session` :

1. relance intégralement `createCartQuote` ;
2. valide et assainit le dossier d'inscription ;
3. refuse une clé Stripe de production ;
4. refuse temporairement les paniers mélangeant plusieurs formules ;
5. vérifie que toutes les inscriptions utilisent le même pays de facturation ;
6. convertit en centimes uniquement le premier paiement calculé par le serveur,
   frais de dossier et options compris ;
7. crée toujours une session Checkout en mode paiement unique ;
8. demande le consentement pour enregistrer la carte et la réutiliser hors
   session pour les échéances scolaires futures ;
9. force Stripe Tax à rester désactivé ;
10. crée une commande `checkout_created` avec le dossier assaini ;
11. renvoie uniquement l'URL de la page Checkout hébergée par Stripe.

Les prix transmis à Checkout sont donc exclusivement ceux du premier paiement
de chaque inscription. Le navigateur ne fournit ni montant ni date.

## Création des échéances Stripe futures

Après `checkout.session.completed`, le webhook confirme d'abord le paiement
initial. Pour une formule mensuelle ou trimestrielle, il crée ensuite un
`Subscription Schedule` à partir des dates exactes du moteur scolaire :

1. il récupère le moyen de paiement enregistré sur le Payment Intent ;
2. il crée les Prices récurrents nécessaires avec des clés d'idempotence stables ;
3. il démarre le calendrier à la date de la première échéance future ;
4. il utilise un intervalle mensuel ou trimestriel selon la formule ;
5. il arrête automatiquement l'abonnement après la dernière échéance ;
6. il conserve Stripe Tax désactivé.

Une formule annuelle ne crée aucun abonnement ni calendrier futur.

La commande passe successivement par les états
`awaiting_initial_payment`, `initial_payment_paid`,
`schedule_provisioning`, puis `scheduled`. Une erreur de création produit
`schedule_failed`. L'événement webhook n'est alors pas marqué comme traité :
Stripe peut le renvoyer et les clés d'idempotence empêchent la création de
doublons.

## Stockage temporaire des commandes

`orderRepository.js` définit les seules opérations utilisées par les services
de paiement. Deux implémentations sont disponibles :

- mémoire locale pour les tests et le serveur Vite ;
- Netlify Blobs pour conserver les commandes et reçus d'événements entre les
  appels des Functions et les déploiements.

Les index par session Checkout et abonnement permettent de retrouver une
commande sans parcourir tout le stockage. Cette couche est temporaire et
modulable : avant une vraie mise en production commerciale, elle pourra être
remplacée par une base transactionnelle en conservant la même interface.

Toutes les lectures de commandes, d'index et de reçus webhook utilisent la
cohérence forte de Netlify Blobs. Le webhook ne dépend donc pas du cache
distribué après une écriture récente effectuée par Checkout ou par une autre
Function.

## Webhook sécurisé et idempotent

La route `/api/stripe-webhook` :

1. lit le corps HTTP brut ;
2. vérifie `Stripe-Signature` avec HMAC SHA-256 et une tolérance de cinq minutes ;
3. refuse toute requête si `STRIPE_WEBHOOK_SECRET` manque ;
4. mémorise chaque identifiant d'événement Stripe traité ;
5. applique des transitions répétables sur la commande ;
6. traite `checkout.session.completed`, `checkout.session.expired`,
   `invoice.paid`, `invoice.payment_failed` et
   `customer.subscription.deleted` ;
7. ne mémorise l'événement de paiement initial qu'après la création réussie du
   calendrier Stripe futur, lorsqu'il est requis.

Un événement déjà reçu renvoie une réponse positive avec `duplicate: true`,
sans rejouer son traitement.

## E-mails transactionnels

Les notifications sont déclenchées exclusivement depuis le webhook, après la
transition persistée de la commande. Pour le paiement initial, elles attendent
également la création réussie du `Subscription Schedule` lorsqu'il est requis.

Cinq modèles sont préparés :

- premier paiement confirmé ;
- échéancier créé ;
- échéance payée ;
- paiement refusé ;
- abonnement annulé.

Chaque modèle possède une version destinée au responsable légal et une
notification interne. Les récapitulatifs peuvent contenir le prénom de l'élève,
son cursus, sa classe et sa formule, mais excluent l'adresse, la date de
naissance, les objectifs pédagogiques et les aménagements.

`transactionalEmailService.js` ne dépend d'aucun fournisseur. Un futur
adaptateur devra implémenter `send(message)` et transmettre la clé
`idempotencyKey` à l'API choisie.

L'adaptateur `brevoEmailProvider.js` est désormais préparé sans être activé. Il
traduit le message générique vers `POST /v3/smtp/email`, configure l'expéditeur
et l'adresse de réponse, transmet la clé d'idempotence à Brevo et classe les
erreurs :

- les délais dépassés, erreurs réseau, réponses 429 et erreurs 5xx restent
  retentables par le webhook ;
- les adresses invalides, destinataires interdits en test et réponses 4xx
  définitives sont enregistrés comme refusés sans boucle de rejeu ;
- une réponse 201 sans identifiant de message est considérée comme invalide et
  retentable.

Le mode de livraison `test` impose une liste explicite d'adresses autorisées.
Une adresse absente de cette liste n'est jamais transmise à Brevo. Le mode
`live` devra être activé manuellement après authentification du domaine et un
test réel contrôlé.

L'idempotence repose sur trois niveaux :

1. le reçu global de l'événement Stripe ;
2. une réservation atomique Netlify Blobs par événement, modèle et audience ;
3. une clé stable destinée au futur fournisseur.

Si un message est déjà terminé, un rejeu ne le renvoie pas. Si une livraison
est encore en cours, le webhook reste en erreur temporaire afin que Stripe la
retente. Une livraison échouée peut être reprise.

L'envoi réel est désactivé par défaut. La commande suivante génère localement
les versions HTML et texte avec des données fictives dans un dossier ignoré par
Git :

```bash
npm run preview:emails
```

Les journaux du service ne contiennent ni adresse e-mail, ni nom, ni contenu du
message. Ils se limitent au modèle, à l'audience, au numéro de commande et à
l'état de traitement.

## Vérification de la page succès

La page transmet son `session_id` à `/api/verify-checkout-session`. Le serveur :

1. récupère directement la session auprès de Stripe ;
2. vérifie ses métadonnées et son appartenance à une commande enregistrée ;
3. consulte l'état persistant alimenté par le webhook ;
4. répond `confirmed: true` uniquement pour une commande `paid`, `active` ou
   `scheduled`.

Même si l'API Stripe renvoie `payment_status: paid`, la commande reste affichée
« en attente » tant que le webhook n'a pas enregistré sa confirmation.

## Portail client préparé

`/api/create-customer-portal` retrouve le Customer Stripe depuis une session
Checkout connue. Le navigateur ne peut donc pas fournir librement un identifiant
client. Le portail reste fermé tant que les deux conditions suivantes ne sont
pas réunies :

- le portail de facturation est configuré dans Stripe Dashboard ;
- `STRIPE_PORTAL_ENABLED=true` est défini côté Netlify.

La clé `STRIPE_SECRET_KEY` reste nécessaire. Aucun secret n'est exposé au front.

## Variables d'environnement

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PORTAL_ENABLED=false
TRANSACTIONAL_EMAIL_MODE=disabled
TRANSACTIONAL_EMAIL_PROVIDER=brevo
TRANSACTIONAL_EMAIL_DELIVERY_MODE=test
TRANSACTIONAL_EMAIL_INTERNAL_RECIPIENT=
TRANSACTIONAL_EMAIL_SENDER_EMAIL=
TRANSACTIONAL_EMAIL_SENDER_NAME=Académie Salsabil
TRANSACTIONAL_EMAIL_REPLY_TO_EMAIL=
TRANSACTIONAL_EMAIL_REPLY_TO_NAME=Académie Salsabil
TRANSACTIONAL_EMAIL_TEST_RECIPIENTS=
TRANSACTIONAL_EMAIL_TIMEOUT_MS=10000
BREVO_API_KEY=
```

Le fichier `.env.example` peut être copié localement, mais `.env` et toutes les
vraies clés restent ignorés par Git.

`TRANSACTIONAL_EMAIL_MODE` doit rester à `disabled` tant qu'un adaptateur
fournisseur, son domaine d'envoi et ses secrets ne sont pas configurés.

La configuration est validée avant de créer le service : une clé absente, une
adresse invalide, une liste de test vide ou un destinataire interne absent de
cette liste bloque l'activation. Aucune clé n'est requise en mode `disabled`.

## Activation manuelle future de Brevo

1. Acheter le domaine et choisir le service de réception ou de redirection.
2. Créer le compte Brevo et y déclarer le domaine d'envoi.
3. Ajouter dans le DNS les enregistrements demandés par Brevo, notamment DKIM
   et DMARC, puis attendre leur validation.
4. Créer et vérifier les adresses d'expédition et de réponse.
5. Générer une clé API Brevo dédiée et la stocker uniquement dans `.env` ou
   dans les variables secrètes Netlify.
6. Renseigner toutes les variables ci-dessus en conservant
   `TRANSACTIONAL_EMAIL_DELIVERY_MODE=test`.
7. Autoriser uniquement les adresses de l'équipe dans
   `TRANSACTIONAL_EMAIL_TEST_RECIPIENTS`, puis réaliser un envoi contrôlé.
8. Contrôler l'expéditeur, le Reply-To, SPF/DKIM/DMARC et la réception.
9. Ajouter les destinataires de recette nécessaires, puis seulement après
   validation passer le mode de livraison à `live`.

Le passage à `TRANSACTIONAL_EMAIL_MODE=provider` ne doit intervenir qu'au
moment du test réel. Le code livré localement reste configuré sur `disabled`.

## Activation future sur Stripe et Netlify

1. Déployer le code lorsque la phase locale est validée.
2. Créer dans Stripe un endpoint vers
   `https://academie-salsabil.netlify.app/api/stripe-webhook`.
3. Sélectionner les cinq événements listés ci-dessus.
4. Enregistrer le secret `whsec_...` comme `STRIPE_WEBHOOK_SECRET` dans Netlify.
5. Lancer un paiement test et contrôler la commande et la page succès.
6. Configurer le portail Stripe, puis seulement ensuite passer
   `STRIPE_PORTAL_ENABLED` à `true`.

## Vérifications locales

```bash
npm run test:quote
npm run test:checkout
npm run test:stripe-schedule
npm run test:webhook
npm run test:session
npm run test:schedule
npm run test:enrollment
npm run test:emails
npm run test:brevo
npm run lint
npm run build
```

## Recette Stripe locale validée

La recette complète a été exécutée le 9 juin 2026 dans la sandbox Stripe
« Académie Salsabil », avec Stripe Tax désactivé :

- formule mensuelle CP avec arabe : premier paiement de 434 EUR, puis neuf
  échéances de 344 EUR du 7 octobre 2026 au 7 juin 2027 ;
- formule trimestrielle CP : premier paiement de 1 100 EUR, puis deux échéances
  de 1 040 EUR les 7 décembre 2026 et 7 mars 2027 ;
- formule annuelle CP : paiement unique de 2 960 EUR et aucun
  `Subscription Schedule`.

Les commandes mensuelle et trimestrielle ont atteint l'état `scheduled`. La
commande annuelle a atteint l'état `paid`. Les calendriers utilisent
`charge_automatically`, possèdent un moyen de paiement par défaut et se
terminent avec `end_behavior=cancel`.

Le rejeu signé du même événement `checkout.session.completed` a renvoyé
`duplicate: true` sans créer de second Price ni de second calendrier.

Les montants restent des placeholders commerciaux. Cette recette valide le
flux technique et devra être rejouée après remplacement du catalogue tarifaire.
