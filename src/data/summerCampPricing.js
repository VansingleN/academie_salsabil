export const summerCampPricing = {
  daysPerWeek: 4,
  attendanceModes: {
    personnalises: {
      label: 'Ateliers personnalisés',
      hourlyRate: 10,
      programIds: ['doux', 'equilibre'],
      durationIds: ['une-semaine', 'deux-semaines', 'un-mois']
    },
    groupes: {
      label: 'Ateliers groupés',
      hourlyRate: 8,
      fixedProgramId: 'doux',
      programIds: ['doux'],
      durationIds: ['deux-semaines', 'un-mois'],
      deposits: {
        'deux-semaines': 20,
        'un-mois': 40
      }
    }
  },
  programs: {
    doux: {
      label: 'Programme doux',
      hoursPerDay: 1
    },
    equilibre: {
      label: 'Programme équilibre',
      hoursPerDay: 1.5
    }
  },
  durations: {
    'une-semaine': {
      label: 'Une semaine',
      weekCount: 1
    },
    'deux-semaines': {
      label: 'Deux semaines',
      weekCount: 2
    },
    'un-mois': {
      label: 'Un mois',
      weekCount: 4
    }
  }
}

export function getSummerCampOfferId(
  attendanceModeId,
  programId,
  durationId,
  levelId = 'primary'
) {
  return `summerCamp-${levelId}-${attendanceModeId}-${programId}-${durationId}`
}

export function getSummerCampPrice(attendanceModeId, programId, durationId) {
  const attendanceMode = summerCampPricing.attendanceModes[attendanceModeId]
  const program = summerCampPricing.programs[programId]
  const duration = summerCampPricing.durations[durationId]

  if (
    !attendanceMode
    || !program
    || !duration
    || !attendanceMode.programIds.includes(programId)
    || !attendanceMode.durationIds.includes(durationId)
  ) {
    return null
  }

  return (
    attendanceMode.hourlyRate
    * program.hoursPerDay
    * summerCampPricing.daysPerWeek
    * duration.weekCount
  )
}

export function getSummerCampDeposit(attendanceModeId, durationId) {
  return summerCampPricing.attendanceModes[attendanceModeId]
    ?.deposits?.[durationId] ?? 0
}
