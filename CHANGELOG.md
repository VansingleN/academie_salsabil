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
