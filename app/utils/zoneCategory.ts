export type ZoneCategory = 'work' | 'flex' | 'sleep'

export function classifyHour(hour: number): ZoneCategory {
  if (hour >= 9 && hour < 17) return 'work'
  if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 22)) return 'flex'
  return 'sleep'
}