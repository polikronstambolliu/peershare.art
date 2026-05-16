export type GearAvailability = {
  dateFrom?: string
  dateTo?: string
  timeFrom?: string
  timeTo?: string
}

const AVAIL_MARKER = '[[PS_AVAIL]]'

export function extractAvailability(rawDescription?: string | null): {
  cleanDescription: string
  availability: GearAvailability
} {
  if (!rawDescription) return { cleanDescription: '', availability: {} }
  const idx = rawDescription.lastIndexOf(AVAIL_MARKER)
  if (idx === -1) return { cleanDescription: rawDescription, availability: {} }

  const base = rawDescription.slice(0, idx).trim()
  const payload = rawDescription.slice(idx + AVAIL_MARKER.length).trim()
  try {
    const parsed = JSON.parse(payload) as GearAvailability
    return { cleanDescription: base, availability: parsed || {} }
  } catch {
    return { cleanDescription: rawDescription, availability: {} }
  }
}

export function withAvailability(description: string, availability: GearAvailability): string | null {
  const clean = description.trim()
  const hasAvailability = Boolean(
    availability.dateFrom || availability.dateTo || availability.timeFrom || availability.timeTo
  )

  if (!hasAvailability) return clean || null
  const payload = JSON.stringify(availability)
  const result = `${clean}\n\n${AVAIL_MARKER} ${payload}`.trim()
  return result || null
}

export function formatAvailabilityRange(availability: GearAvailability): string | null {
  const datePart = availability.dateFrom && availability.dateTo
    ? `${availability.dateFrom} -> ${availability.dateTo}`
    : availability.dateFrom || availability.dateTo || ''

  const timePart = availability.timeFrom && availability.timeTo
    ? `${availability.timeFrom} - ${availability.timeTo}`
    : availability.timeFrom || availability.timeTo || ''

  const parts = [datePart, timePart].filter(Boolean)
  return parts.length ? parts.join(' | ') : null
}
