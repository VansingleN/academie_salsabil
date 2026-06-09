// Ce fichier est l'unique source de vérité des dates commerciales de l'année.
// Les dates sont provisoires tant que la rentrée officielle n'est pas arrêtée.
export const activeSchoolYear = {
  id: '2026-2027',
  label: 'Année scolaire 2026-2027',
  status: 'provisional',
  timezone: 'Europe/Paris',
  schoolStart: '2026-09-01',
  schoolEnd: '2027-06-30',
  annualEnrollmentDeadline: '2026-08-31',
  monthlyPeriods: [
    { id: '2026-09', label: 'Septembre 2026', start: '2026-09-01', end: '2026-09-30', chargeDate: null },
    { id: '2026-10', label: 'Octobre 2026', start: '2026-10-01', end: '2026-10-31', chargeDate: '2026-10-07' },
    { id: '2026-11', label: 'Novembre 2026', start: '2026-11-01', end: '2026-11-30', chargeDate: '2026-11-07' },
    { id: '2026-12', label: 'Décembre 2026', start: '2026-12-01', end: '2026-12-31', chargeDate: '2026-12-07' },
    { id: '2027-01', label: 'Janvier 2027', start: '2027-01-01', end: '2027-01-31', chargeDate: '2027-01-07' },
    { id: '2027-02', label: 'Février 2027', start: '2027-02-01', end: '2027-02-28', chargeDate: '2027-02-07' },
    { id: '2027-03', label: 'Mars 2027', start: '2027-03-01', end: '2027-03-31', chargeDate: '2027-03-07' },
    { id: '2027-04', label: 'Avril 2027', start: '2027-04-01', end: '2027-04-30', chargeDate: '2027-04-07' },
    { id: '2027-05', label: 'Mai 2027', start: '2027-05-01', end: '2027-05-31', chargeDate: '2027-05-07' },
    { id: '2027-06', label: 'Juin 2027', start: '2027-06-01', end: '2027-06-30', chargeDate: '2027-06-07' }
  ],
  quarterlyPeriods: [
    {
      id: 'term-1',
      label: '1er trimestre',
      start: '2026-09-01',
      end: '2026-11-30',
      chargeDate: null
    },
    {
      id: 'term-2',
      label: '2e trimestre',
      start: '2026-12-01',
      end: '2027-02-28',
      chargeDate: '2026-12-07'
    },
    {
      id: 'term-3',
      label: '3e trimestre',
      start: '2027-03-01',
      end: '2027-06-30',
      chargeDate: '2027-03-07'
    }
  ]
}

