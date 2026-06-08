# Architecture du paiement

## Étape actuelle : devis serveur

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

## Fichiers importants

- `src/data/offerCatalog.js` : catalogue commercial partagé ;
- `src/server/cartQuote.js` : validation et calcul côté serveur ;
- `netlify/functions/validate-cart.mjs` : adaptateur HTTP Netlify ;
- `vite.cart-quote-plugin.js` : équivalent local pour le développement ;
- `src/utils/cartQuoteApi.js` : appel du front vers le serveur ;
- `scripts/test-cart-quote.mjs` : tests de sécurité essentiels.

## Limite volontaire

Le catalogue reste visible dans le JavaScript du navigateur afin d'afficher les
formules rapidement. Cela n'est pas une faille : le futur paiement utilisera
uniquement le devis recalculé par la fonction serveur.

La prochaine étape Stripe devra appeler à nouveau le même moteur serveur au
moment de créer la session Checkout. Elle ne devra jamais accepter les totaux
affichés ou stockés côté client.

La fonction déclare elle-même le chemin public `/api/cart-quote`. La redirection
présente dans `netlify.toml` reste une compatibilité supplémentaire, mais le
fonctionnement du panier ne dépend plus d'elle seule.
