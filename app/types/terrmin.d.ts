export interface Participant {
  id: string
  name?: string
  timezone: string
}

export interface TerrminMeetingState {
  participants: Participant[]
  date: string
  anchorTime: string
  anchorTz: string
  durationMinutes: number
  mode: 'find' | 'share'
}