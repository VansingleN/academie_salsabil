export function formatEuro(amount) {
  return `${amount.toLocaleString('fr-FR')} €`
}

export function formatDate(dateValue) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${dateValue}T00:00:00.000Z`))
}

export function buildPricingPlans(pricing, fees, availability = {}) {
  const monthlyReference = pricing.monthly * 10
  const quarterlyTotal = pricing.quarterly * 3
  const quarterlySavings = Math.round((1 - quarterlyTotal / monthlyReference) * 100)
  const annualSavings = Math.round((1 - pricing.annual / monthlyReference) * 100)
  return [
    {
      id: 'monthly',
      name: 'Mensuel',
      eyebrow: 'Souplesse',
      amount: pricing.monthly,
      price: formatEuro(pricing.monthly),
      period: 'HT / mois',
      description:
        "Une formule flexible pour avancer mois après mois, sans immobiliser le coût de l'année scolaire.",
      details: [
        '10 mensualités sur l’année scolaire',
        `Frais de dossier : ${formatEuro(fees.monthly)} HT`,
        'Première échéance encaissée à l’inscription',
        'Échéances suivantes le 7 de chaque mois'
      ],
      available: availability.monthly ?? true
    },
    {
      id: 'quarterly',
      name: 'Trimestriel',
      eyebrow: 'Équilibre',
      amount: pricing.quarterly,
      price: formatEuro(pricing.quarterly),
      period: 'HT / trimestre',
      badge: `Environ ${quarterlySavings} % économisés`,
      description:
        'Trois règlements planifiés pour bénéficier d’un tarif réduit tout en répartissant les dépenses.',
      details: [
        '3 règlements sur l’année scolaire',
        `Total annuel : ${formatEuro(quarterlyTotal)} HT`,
        `Frais de dossier : ${formatEuro(fees.quarterly)} HT`,
        'Premier trimestre encaissé à l’inscription',
        'Échéances suivantes les 7 décembre et 7 mars'
      ],
      available: availability.quarterly ?? true
    },
    {
      id: 'annual',
      name: 'Annuel',
      eyebrow: 'Sérénité',
      amount: pricing.annual,
      price: formatEuro(pricing.annual),
      period: 'HT / année scolaire',
      badge: 'Meilleur tarif',
      featured: true,
      description:
        'Un seul engagement pour toute l’année, avec la dégressivité la plus avantageuse et les frais inclus.',
      details: [
        `Environ ${annualSavings} % économisés`,
        'Frais de dossier inclus',
        'Paiement complet à l’inscription',
        'Disponible jusqu’à la veille de la rentrée'
      ],
      available: availability.annual ?? true,
      unavailableReason: availability.annual === false
        ? 'Formule fermée après la veille de la rentrée'
        : null
    }
  ]
}
