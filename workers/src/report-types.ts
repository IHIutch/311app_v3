import slugify from 'slugify'

export const reportStatuses = ['CREATED', 'IN_REVIEW', 'ASSIGNED', 'SCHEDULED', 'CLOSED'] as const

export const statusLabel: Record<(typeof reportStatuses)[number] | 'OPEN', string> = {
  OPEN: 'Open',
  CREATED: 'Open',
  IN_REVIEW: 'In review',
  ASSIGNED: 'Assigned',
  SCHEDULED: 'Scheduled',
  CLOSED: 'Closed',
}

export function reportTypeSlug(name: string) {
  return slugify(name, { lower: true, strict: true })
}

export function hasMapLocation({ lat, lng }: { lat: number; lng: number }) {
  return Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    Number.isFinite(lng) && Math.abs(lng) <= 180
}
