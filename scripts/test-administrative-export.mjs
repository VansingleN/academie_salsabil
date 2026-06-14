import assert from 'node:assert/strict'
import {
  AdministrativeExportError,
  createAdministrativeExport
} from '../src/server/administrativeExport.js'

const generatedAt = new Date('2026-06-14T10:30:00.000Z')
const supportRecord = {
  reference: 'SUP-001',
  status: 'new',
  createdAt: generatedAt.toISOString(),
  mode: 'advice',
  contact: {
    parentName: '=HYPERLINK("https://example.test")',
    email: 'parent@example.test',
    phone: '+33123456789',
    preferredMethod: 'email'
  },
  student: { age: 12, level: '5e' },
  request: {
    subjects: ['Mathématiques'],
    objective: 'Consolider les bases',
    availability: 'Mercredi',
    needType: 'regular',
    format: 'online',
    weeklyVolume: 2
  }
}

const csv = createAdministrativeExport({
  section: 'support',
  format: 'csv',
  records: [supportRecord],
  generatedAt
})
assert.equal(csv.filename, 'academie-salsabil-support-2026-06-14.csv')
assert.match(csv.contentType, /^text\/csv/)
assert.ok(csv.body.startsWith('\uFEFF'))
assert.ok(csv.body.includes(`"'=HYPERLINK(""https://example.test"")"`))
assert.ok(csv.body.includes(`"'+33123456789"`))

const json = createAdministrativeExport({
  section: 'support',
  format: 'json',
  records: [supportRecord],
  generatedAt
})
const parsed = JSON.parse(json.body)
assert.equal(parsed.count, 1)
assert.equal(parsed.records[0].reference, 'SUP-001')

assert.throws(
  () => createAdministrativeExport({
    section: 'unknown',
    format: 'json',
    records: []
  }),
  (error) =>
    error instanceof AdministrativeExportError
    && error.code === 'INVALID_EXPORT_SECTION'
)

console.log('Exports administratifs : OK')
