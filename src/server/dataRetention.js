const POLICY_VERSION = '2026-06-14'
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

export const DATA_RETENTION_POLICY = Object.freeze({
  version: POLICY_VERSION,
  supportRequests: Object.freeze({
    openMonths: 12,
    closedMonths: 6,
    warningDays: 30,
    graceDays: 30
  }),
  contactMessages: Object.freeze({
    openMonths: 12,
    closedMonths: 6,
    warningDays: 30,
    graceDays: 30
  }),
  enrollmentRecords: Object.freeze({
    pedagogicalReviewMonthsAfterService: 12,
    commercialArchiveYears: 5,
    accountingArchiveYears: 10,
    automaticDeletionEnabled: false
  })
})

function parseDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function addUtcMonths(date, months) {
  const result = new Date(date)
  const day = result.getUTCDate()

  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)

  const lastDay = new Date(Date.UTC(
    result.getUTCFullYear(),
    result.getUTCMonth() + 1,
    0
  )).getUTCDate()

  result.setUTCDate(Math.min(day, lastDay))
  return result
}

function getRecordExpiry(record, policy) {
  const isClosed = record.status === 'closed'
  const referenceDate = parseDate(
    isClosed ? record.updatedAt ?? record.createdAt : record.createdAt
  )

  if (!referenceDate) return null

  return addUtcMonths(
    referenceDate,
    isClosed ? policy.closedMonths : policy.openMonths
  )
}

function addUtcDays(date, days) {
  return new Date(date.getTime() + days * DAY_IN_MILLISECONDS)
}

export function getSupportRequestExpiry(request) {
  return getRecordExpiry(request, DATA_RETENTION_POLICY.supportRequests)
}

export function getContactMessageExpiry(message) {
  return getRecordExpiry(message, DATA_RETENTION_POLICY.contactMessages)
}

function withoutRetention(record) {
  const remaining = { ...record }
  delete remaining.retention
  return remaining
}

async function purgeExpiredRecords({
  repository,
  getExpiry,
  policy,
  now = new Date()
}) {
  if (!repository?.list || !repository?.update || !repository?.delete) {
    throw new Error('Le dépôt de données ne permet pas la purge.')
  }

  const currentDate = parseDate(now)
  if (!currentDate) {
    throw new Error('La date de purge est invalide.')
  }

  const records = await repository.list()
  const report = {
    scanned: records.length,
    warned: 0,
    warningsCleared: 0,
    eligibleForDeletion: 0,
    deleted: 0,
    failedIds: []
  }

  for (const record of records) {
    const expiry = getExpiry(record)
    if (!expiry) continue

    const warningAt = addUtcDays(expiry, -policy.warningDays)
    const normalDeletionAt = addUtcDays(expiry, policy.graceDays)
    const hasCurrentWarning = record.retention?.policyVersion === POLICY_VERSION

    if (currentDate.getTime() < warningAt.getTime()) {
      if (record.retention) {
        const updated = await repository.update(withoutRetention(record))
        if (updated) report.warningsCleared += 1
        else report.failedIds.push(record.id)
      }
      continue
    }

    if (!hasCurrentWarning) {
      const deletionAt = currentDate.getTime() >= expiry.getTime()
        ? addUtcDays(currentDate, policy.graceDays)
        : normalDeletionAt
      const retention = {
        policyVersion: POLICY_VERSION,
        warnedAt: currentDate.toISOString(),
        expiresAt: expiry.toISOString(),
        scheduledDeletionAt: deletionAt.toISOString()
      }
      const updated = await repository.update({ ...record, retention })
      if (updated) report.warned += 1
      else report.failedIds.push(record.id)
      continue
    }

    const scheduledDeletionAt = parseDate(record.retention.scheduledDeletionAt)
    if (!scheduledDeletionAt) {
      const retention = {
        policyVersion: POLICY_VERSION,
        warnedAt: currentDate.toISOString(),
        expiresAt: expiry.toISOString(),
        scheduledDeletionAt: addUtcDays(currentDate, policy.graceDays).toISOString()
      }
      const updated = await repository.update({ ...record, retention })
      if (updated) report.warned += 1
      else report.failedIds.push(record.id)
      continue
    }

    if (record.retention.expiresAt !== expiry.toISOString()) {
      const deletionAt = currentDate.getTime() >= expiry.getTime()
        ? addUtcDays(currentDate, policy.graceDays)
        : normalDeletionAt
      const updated = await repository.update({
        ...record,
        retention: {
          ...record.retention,
          warnedAt: currentDate.toISOString(),
          expiresAt: expiry.toISOString(),
          scheduledDeletionAt: deletionAt.toISOString()
        }
      })
      if (!updated) report.failedIds.push(record.id)
      continue
    }

    if (scheduledDeletionAt.getTime() <= currentDate.getTime()) {
      report.eligibleForDeletion += 1
      const deleted = await repository.delete(record.id)
      if (deleted) report.deleted += 1
      else report.failedIds.push(record.id)
    }
  }

  return report
}

export function purgeExpiredSupportRequests(repository, options = {}) {
  return purgeExpiredRecords({
    repository,
    getExpiry: getSupportRequestExpiry,
    policy: DATA_RETENTION_POLICY.supportRequests,
    ...options
  })
}

export function purgeExpiredContactMessages(repository, options = {}) {
  return purgeExpiredRecords({
    repository,
    getExpiry: getContactMessageExpiry,
    policy: DATA_RETENTION_POLICY.contactMessages,
    ...options
  })
}
