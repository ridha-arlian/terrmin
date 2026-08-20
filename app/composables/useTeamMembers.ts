import { useLocalStorage } from '@vueuse/core'
import type { TeamMember } from '@/utils/timezone'

const members = useLocalStorage<TeamMember[]>('terrmin-members', [])

export function useTeamMembers() {
  function addMember(data: Omit<TeamMember, 'id'>) {
    members.value.push({ ...data, id: crypto.randomUUID() })
  }

  function removeMember(id: string) {
    members.value = members.value.filter(m => m.id !== id)
  }

  return { members, addMember, removeMember }
}