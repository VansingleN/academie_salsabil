// La structure fiscale est prête, mais aucun taux ne sera appliqué avant la
// création de l'entité juridique et la validation de ses immatriculations.
export const taxPolicy = {
  calculationMode: 'disabled',
  priceBehavior: 'exclusive',
  countryRequired: true,
  provider: null,
  reason: 'seller_entity_not_configured'
}

