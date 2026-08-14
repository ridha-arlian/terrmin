const VALID_TIMEZONES = new Set(Intl.supportedValuesOf('timeZone'))

export function isValidTimezone(tz: string): boolean {
  return VALID_TIMEZONES.has(tz)
}

export function sanitizeTimezoneList(raw: string): string[] {
  return raw
    .split(',')
    .map(tz => tz.trim())
    .filter(tz => tz.length > 0 && isValidTimezone(tz))
}

export function isValidDateString(raw: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(new Date(raw).getTime())
}

export function isValidTimeString(raw: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(raw)
}