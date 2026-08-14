import { sanitizeTimezoneList, isValidDateString, isValidTimeString } from '~/utils/urlCodec'

function parseParticipants(tzParam: string, nameParam: string): Participant[] {
  const validTzs = sanitizeTimezoneList(tzParam)
  const names = nameParam.split(',')

  const rawTzs = tzParam.split(',').map(s => s.trim())
  return validTzs.map((tz) => {
    const originalIndex = rawTzs.indexOf(tz)
    return {
      id: `${tz}-${originalIndex}`,
      name: names[originalIndex]?.trim() || undefined,
      timezone: tz,
    }
  })
}

const state = computed<TerrminMeetingState>(() => {
  const q = route.query
  const rawDate = q.d as string
  const rawTime = (q.t as string)?.replace(/^(\d{2})(\d{2})$/, '$1:$2')

  return {
    participants: parseParticipants((q.tz as string) ?? '', (q.n as string) ?? ''),
    date: isValidDateString(rawDate) ? rawDate : new Date().toISOString().slice(0, 10),
    anchorTime: rawTime && isValidTimeString(rawTime) ? rawTime : '09:00',
    anchorTz: (q.rtz as string) && isValidTimezone(q.rtz as string)
      ? (q.rtz as string)
      : Intl.DateTimeFormat().resolvedOptions().timeZone,
    durationMinutes: Number.isFinite(Number(q.dur)) && Number(q.dur) > 0 ? Number(q.dur) : DEFAULT_DURATION,
    mode: (q.mode as 'find' | 'share') ?? 'find',
  }
})