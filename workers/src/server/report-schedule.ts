export function isScheduledDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export async function updateReportSchedule(db: D1Database, update: {
  id: number
  status: string
  scheduledDate: string | null
  actorId: string
}) {
  const { id, status, scheduledDate, actorId } = update
  const now = new Date().toISOString()
  await db.batch([
    db.prepare(`
      INSERT INTO changelog (objectId, oldValue, newValue, objectAttr, creatorId, createdAt, updatedAt)
      SELECT id, json_quote(status), json_quote(?), 'status', ?, ?, ?
        FROM reports WHERE id = ? AND deletedAt IS NULL AND status <> ?
    `).bind(status, actorId, now, now, id, status),
    db.prepare(`
      INSERT INTO changelog (objectId, oldValue, newValue, objectAttr, creatorId, createdAt, updatedAt)
      SELECT id, json_quote(scheduledDate), json_quote(?), 'scheduledDate', ?, ?, ?
        FROM reports WHERE id = ? AND deletedAt IS NULL AND scheduledDate IS NOT ?
    `).bind(scheduledDate, actorId, now, now, id, scheduledDate),
    db.prepare(`
      UPDATE reports SET status = ?, scheduledDate = ?, updatedAt = ?
       WHERE id = ? AND deletedAt IS NULL AND (status <> ? OR scheduledDate IS NOT ?)
    `).bind(status, scheduledDate, now, id, status, scheduledDate),
  ])
}
