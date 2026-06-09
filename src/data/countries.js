import countries from 'i18n-iso-countries'

const frenchRegionNames = new Intl.DisplayNames(['fr'], { type: 'region' })

// La bibliothèque fournit la liste ISO complète ; Intl fournit les libellés
// français sans maintenir manuellement près de 250 pays dans le projet.
export const billingCountryChoices = Object.keys(countries.getAlpha2Codes())
  .map((code) => ({
    value: code,
    label: frenchRegionNames.of(code) ?? code
  }))
  .sort((left, right) => left.label.localeCompare(right.label, 'fr'))

export function isValidBillingCountry(countryCode) {
  return typeof countryCode === 'string'
    && countries.isValid(countryCode.toUpperCase())
}

export function getBillingCountryLabel(countryCode) {
  return isValidBillingCountry(countryCode)
    ? frenchRegionNames.of(countryCode.toUpperCase()) ?? countryCode
    : ''
}

export const billingCountryField = {
  name: 'billingCountry',
  label: 'Pays de facturation',
  placeholder: 'Choisir le pays de facturation',
  required: true,
  choices: billingCountryChoices
}

// EnrollmentModal utilise le nom `options`, tandis que le catalogue serveur
// conserve `choices`. Ce helper garde les deux représentations synchronisées.
export function withBillingCountryField(fields) {
  return [
    ...fields,
    {
      name: billingCountryField.name,
      label: billingCountryField.label,
      placeholder: billingCountryField.placeholder,
      required: billingCountryField.required,
      options: billingCountryChoices
    }
  ]
}
