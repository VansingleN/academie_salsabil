export function formatEuro(amount) {
  return `${amount.toLocaleString('fr-FR')} €`
}

export function buildPricingPlans(pricing, fees) {
  const monthlyReference = pricing.monthly * 10
  const quarterlyTotal = pricing.quarterly * 3
  const quarterlySavings = Math.round((1 - quarterlyTotal / monthlyReference) * 100)
  const annualSavings = Math.round((1 - pricing.annual / monthlyReference) * 100)
  const quarterlyDeposit = Math.round((pricing.quarterly * 0.3) / 5) * 5
  const annualDeposit = Math.round((pricing.annual * 0.2) / 5) * 5

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
        `Acompte à l’inscription : ${formatEuro(pricing.monthly)} HT`,
        'Acompte déduit de la première mensualité'
      ]
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
        `Acompte : ${formatEuro(quarterlyDeposit)} HT, déduit du premier trimestre`
      ]
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
        `Acompte à l’inscription : ${formatEuro(annualDeposit)} HT`,
        `Solde de ${formatEuro(pricing.annual - annualDeposit)} HT avant la rentrée`
      ]
    }
  ]
}
