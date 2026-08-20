export interface TeamMember {
  id: string
  name: string
  timezone: string
  workStart: number
  workEnd: number
}

export interface TimezoneOption {
  value: string
  label: string
}

export function getOffsetMinutes(timeZone: string, date = new Date()): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    }).formatToParts(date)

    const raw = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+00:00'
    const match = raw.match(/GMT([+-])(\d{2}):(\d{2})/)
    if (!match) return 0

    const sign = match[1] === '-' ? -1 : 1
    const hours = parseInt(match[2] ?? '0', 10)
    const minutes = parseInt(match[3] ?? '0', 10)

    return sign * (hours * 60 + minutes)
  } catch {
    return 0
  }
}

export function getLocalTimeString(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date())
  } catch {
    return '00:00'
  }
}

function isWorkingAtUTCHour(utcHour: number, offsetMinutes: number, workStart: number, workEnd: number): boolean {
  let local = (utcHour + offsetMinutes / 60) % 24
  if (local < 0) local += 24

  return workStart <= workEnd
    ? local >= workStart && local < workEnd
    : local >= workStart || local < workEnd
}

export function computeOverlap(members: TeamMember[]) {
  const hours = Array.from({ length: 24 }, (_, utcHour) => {
    const workingMembers = members.filter(m => 
      isWorkingAtUTCHour(utcHour, getOffsetMinutes(m.timezone), m.workStart, m.workEnd)
    )
    return { utcHour, workingMembers, count: workingMembers.length }
  })

  const fullOverlap = hours.filter(h => members.length > 0 && h.count === members.length)
  return { hours, fullOverlap, hasFullOverlap: fullOverlap.length > 0 }
}

export function getAllTimezones(): TimezoneOption[] {
  return Intl.supportedValuesOf('timeZone').map(tz => ({
    value: tz,
    label: tz.replace(/_/g, ' ').replace('/', '/')
  }))
}

export function getLocalHourFraction(timeZone: string, date = new Date()): number {
  try {
    const offsetMinutes = getOffsetMinutes(timeZone, date)

    const utcHours = date.getUTCHours()
    const utcMinutes = date.getUTCMinutes()
    const utcSeconds = date.getUTCSeconds()

    const totalUtcMinutes = utcHours * 60 + utcMinutes + utcSeconds / 60

    let targetMinutes = (totalUtcMinutes + offsetMinutes) % 1440
    if (targetMinutes < 0) targetMinutes += 1440

    return targetMinutes / 60
  } catch {
    return 0
  }
}

export function getMemberColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

export function getOverlapWindows(members: TeamMember[], viewerTimezone: string) {
  if (members.length === 0) return []

  const { hours } = computeOverlap(members)
  const viewerOffset = getOffsetMinutes(viewerTimezone)

  const fullHours = hours
    .filter(h => h.count === members.length)
    .map(h => {
      let local = (h.utcHour + viewerOffset / 60) % 24
      if (local < 0) local += 24
      return Math.floor(local)
    })
    .sort((a, b) => a - b)

  const ranges: { start: number; end: number }[] = []
  for (const h of fullHours) {
    const last = ranges[ranges.length - 1]
    if (last && last.end === h) {
      last.end = h + 1
    } else {
      ranges.push({ start: h, end: h + 1 })
    }
  }

  return ranges.map(r => ({
    label: `${String(r.start).padStart(2, '0')}:00 – ${String(r.end % 24).padStart(2, '0')}:00`,
  }))
}