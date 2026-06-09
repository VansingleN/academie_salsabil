# Changelog

Tous les changements importants apportés au projet sont consignés dans ce fichier.
<!-- Ajouter les prochaines évolutions dans "Non publié", puis créer une section datée au moment d'une version. -->

## Non publié

### Ajouté

- Mise en place d'un changelog maintenu au fil des évolutions importantes.
- Ajout de l'option payante « Langue arabe » pour les classes de CP, CE1, CE2, CM1, CM2 et 6e.
- Calcul dynamique du supplément selon la formule mensuelle, trimestrielle ou annuelle.
- Enregistrement séparé du tarif de base, du supplément et du total dans le panier.
- Création d'un catalogue centralisé pour les cursus, classes, formules, options et tarifs.
- Création d'une page de panier invité avec récapitulatif par rythme de paiement.
- Ajout d'un compteur de panier dans la barre de navigation.
- Modification des classes, formules, créneaux et langues directement depuis le panier.
- Suppression individuelle des inscriptions et vidage complet du panier.
- Préparation des offres pour les paiements uniques, abonnements, échéances, acomptes et frais de dossier.
- Ajout d'une Netlify Function qui valide le panier et recalcule les tarifs côté serveur.
- Ajout d'une route locale Vite utilisant le même moteur de devis que Netlify.
- Affichage dans le panier de l'état de vérification sécurisée du devis.
- Ajout de tests automatisés contre l'injection de prix et les options invalides.
- Documentation de l'architecture du devis serveur et de son futur raccordement à Stripe.
- Remplacement du README générique de Vite par le changelog principal du projet.
- Ajout de Stripe Checkout hébergé en mode test.
- Ajout d'une Netlify Function qui recrée et revalide chaque session Checkout.
- Ajout des pages de retour après réussite ou annulation d'un paiement test.
- Ajout de tests automatisés des paramètres envoyés à Stripe.
- Ajout d'un dépôt de commandes interchangeable avec implémentations mémoire et Netlify Blobs.
- Ajout d'un webhook Stripe signé et idempotent pour les paiements, échecs,
  expirations et suppressions d'abonnement.
- Ajout d'une vérification serveur des sessions Stripe utilisée par la page de succès.
- Préparation du portail client Stripe, désactivé par défaut.
- Ajout de tests automatisés de signature, doublons, transitions de commande,
  vérification des sessions et ouverture du portail.
- Ajout d'un calendrier scolaire 2026-2027 configurable.
- Ajout du moteur d'échéancier mensuel, trimestriel et annuel.
- Ajout du prorata journalier pour les inscriptions trimestrielles tardives.
- Ajout du pays de facturation obligatoire et d'une structure fiscale désactivée.
- Ajout de l'affichage du premier paiement, des échéances futures et des périodes
  couvertes dans les modales et le panier.
- Ajout des tests automatisés du calendrier, des proratas et de la fermeture annuelle.
- Ajout de l'encaissement Stripe limité au premier paiement calculé par le
  serveur, frais de dossier et options compris.
- Ajout du consentement Checkout permettant d'enregistrer le moyen de paiement
  pour les échéances hors session.
- Ajout de la création idempotente des `Subscription Schedule` mensuels et
  trimestriels après confirmation du webhook.
- Ajout des états de commande dédiés à la préparation, à la réussite et à
  l'échec du calendrier Stripe.
- Ajout des tests automatisés des dates, montants, reprises et doublons des
  calendriers Stripe.
- Validation locale complète dans la sandbox Stripe des parcours mensuel,
  trimestriel et annuel.
- Validation du rejeu signé d'un webhook sans duplication du calendrier Stripe.
- Activation des lectures à cohérence forte dans Netlify Blobs pour les
  commandes, index et reçus webhook.
- Refus côté serveur des identifiants de lignes de panier dupliqués afin de
  protéger les clés d'idempotence des Prices Stripe.
- Ajout d'un dossier d'inscription modulable avant Stripe Checkout.
- Ajout des informations du responsable légal, de l'adresse de facturation et
  d'une fiche pédagogique par enfant.
- Ajout des consentements explicites aux CGV, à l'échéancier et à
  l'enregistrement du moyen de paiement.
- Versionnement et horodatage serveur des consentements.
- Ajout d'une validation serveur stricte des données personnelles, des
  correspondances élèves/panier et du pays de facturation.
- Ajout de tests garantissant que les informations personnelles ne sont pas
  placées dans les métadonnées Stripe.
- Ajout d'un numéro de commande lisible de type `AS-2627-XXXXXXXX`.
- Ajout d'une architecture d'e-mails transactionnels indépendante du
  fournisseur et désactivée par défaut.
- Ajout des modèles famille et équipe pour le paiement initial, la création de
  l'échéancier, les échéances payées, les impayés et les annulations.
- Ajout d'un mode local de prévisualisation HTML et texte avec données fictives.
- Ajout de reçus atomiques par événement, modèle et audience pour empêcher les
  doublons lors des rejeux webhook.
- Ajout d'une clé d'idempotence stable à transmettre au futur fournisseur.
- Ajout de journaux techniques ne contenant aucune donnée personnelle.
- Ajout d'un adaptateur HTTP Brevo indépendant du service transactionnel.
- Ajout d'un mode de livraison de test limité à une liste blanche explicite.
- Ajout de la gestion des délais d'attente, erreurs réseau, réponses invalides
  et erreurs Brevo temporaires ou définitives.
- Ajout de tests simulant les réponses utiles de l'API Brevo sans envoi réel.
- Documentation des variables d'environnement et de l'activation future du
  domaine d'envoi.

### Modifié

- Le stockage local ne conserve désormais que les identifiants d'offres et les choix du client.
- Les prix affichés dans le panier sont recalculés depuis le catalogue, sans faire confiance aux montants stockés.
- Migration automatique des anciens articles déjà présents dans le stockage local.
- Les totaux du récapitulatif utilisent la réponse serveur dès que le devis est validé.
- La configuration Vite conserve GitHub Pages tout en préparant un déploiement Netlify à la racine.
- La route `/api/cart-quote` est désormais déclarée directement par la Netlify Function
  pour garantir son exposition sur le site public.
- Le bouton du panier ouvre Stripe uniquement après validation du devis serveur.
- Les clés Stripe live sont refusées tant que l'intégration reste en phase de test.
- Les paniers mélangeant plusieurs formules sont temporairement bloqués avant Checkout.
- Chaque session Checkout crée désormais une commande serveur identifiée dans
  les métadonnées Stripe.
- La page de succès n'affiche une confirmation qu'après validation persistante
  par le webhook, jamais sur la seule base de la redirection.
- Les frais de dossier sont désormais intégralement affectés au premier paiement.
- Les options payantes sont réparties sur chaque échéance et proratisées avec la
  période en cas d'inscription trimestrielle tardive.
- La formule annuelle reste visible mais devient indisponible après la veille de
  la rentrée.
- Checkout utilise désormais toujours un paiement unique et ne facture que la
  première échéance calculée par le moteur scolaire.
- Les échéances mensuelles et trimestrielles futures sont créées uniquement
  après la confirmation signée du paiement initial.
- La formule annuelle ne crée aucun abonnement futur.
- Stripe Tax reste explicitement désactivé dans Checkout, les Prices et les
  calendriers d'abonnement.
- Le bouton Checkout ouvre désormais le dossier d'inscription avant toute
  création de session Stripe.
- Les informations personnelles du dossier sont conservées uniquement dans la
  commande serveur et ne sont pas enregistrées dans le panier local.
- La page de confirmation affiche désormais le numéro de commande lisible à la
  place de l'identifiant technique Stripe.
- Le webhook traite les notifications seulement après la confirmation
  persistée du paiement et de l'échéancier.
- Les erreurs e-mail temporaires provoquent une reprise du webhook, tandis que
  les refus définitifs sont enregistrés sans boucle de rejeu.
- Le mode transactionnel reste `disabled` tant que Brevo, le domaine et toutes
  les adresses requises ne sont pas configurés.

## Changements depuis le commit 11a8b58

### Cursus et tarification

- Ajout des formules mensuelles, trimestrielles et annuelles pour chaque classe.
- Tarifs dynamiques de la maternelle au lycée.
- Calcul automatique des remises, acomptes, soldes et frais de dossier.
- Ajout de sélecteurs de classe dans les sections tarifaires.

### Inscriptions et panier

- Création d'une modale d'inscription réutilisable et configurable.
- Ajout des tranches horaires Matin et Après-midi.
- Persistance du panier dans le stockage local.
- Conservation de la classe, de la formule, des options et du prix exact.

### Langues

- Ajout des options LV2 et LV3 au collège et au lycée.
- Choix entre l'espagnol et l'arabe avec exclusion des doublons.
- Tarification dégressive de la LV3 selon la formule sélectionnée.

### Soutien scolaire

- Remplacement du carrousel automatique par une navigation manuelle.
- Ajout de flèches latérales et de cartes verticales plus lisibles.
