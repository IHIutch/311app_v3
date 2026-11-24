import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { isScheduledDate, updateReportSchedule } from '../src/server/report-schedule.ts'

assert.equal(isScheduledDate(null), false)
assert.equal(isScheduledDate('2027-02-29'), false)
assert.equal(isScheduledDate('2028-02-29'), true)
assert.equal(isScheduledDate('2028-2-29'), false)
assert.equal(isScheduledDate('2028-02-29T12:00:00Z'), false)

using db = new DatabaseSync(':memory:')
db.exec(readFileSync(new URL('../migrations/0001_application.sql', import.meta.url), 'utf8'))
db.exec(`
  INSERT INTO users (id, publicId, type) VALUES ('admin', 'admin', 'ADMIN');
  INSERT INTO reportTypes (id, name, "group", markerColor) VALUES (1, 'Pothole', 'Streets', '#000');
  INSERT INTO reports (id, lat, lng, status, reportTypeId) VALUES (311, 42.9, -78.9, 'SCHEDULED', 1);
`)
db.exec(readFileSync(new URL('../migrations/0002_scheduled_date.sql', import.meta.url), 'utf8'))

const d1 = {
  prepare(sql) {
    const statement = db.prepare(sql)
    return { bind: (...params) => () => statement.run(...params) }
  },
  async batch(operations) {
    db.exec('BEGIN')
    try {
      for (const operation of operations) operation()
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  },
}
const state = () => ({ ...db.prepare('SELECT status, scheduledDate FROM reports WHERE id = 311').get() })
const update = (status, scheduledDate) => updateReportSchedule(d1, { id: 311, status, scheduledDate, actorId: 'admin' })
assert.deepEqual(state(), { status: 'SCHEDULED', scheduledDate: null })
await update('SCHEDULED', '2028-02-29')
assert.deepEqual(state(), { status: 'SCHEDULED', scheduledDate: '2028-02-29' })
await update('SCHEDULED', '2028-03-01')
await update('SCHEDULED', '2028-03-01')
assert.deepEqual(state(), { status: 'SCHEDULED', scheduledDate: '2028-03-01' })
await update('CLOSED', null)
assert.deepEqual(state(), { status: 'CLOSED', scheduledDate: null })
const history = db.prepare('SELECT objectAttr, oldValue, newValue FROM changelog ORDER BY id').all()
assert.deepEqual(history.map(row => [row.objectAttr, JSON.parse(row.oldValue), JSON.parse(row.newValue)]), [
  ['scheduledDate', null, '2028-02-29'],
  ['scheduledDate', '2028-02-29', '2028-03-01'],
  ['status', 'SCHEDULED', 'CLOSED'],
  ['scheduledDate', '2028-03-01', null],
])
console.log('Legacy reports, scheduling dates, rescheduling, clearing dates, and history passed.')
