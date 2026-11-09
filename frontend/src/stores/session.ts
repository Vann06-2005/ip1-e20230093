import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Role } from '@/types'

// M1 stand-in for login: pick a role in the header. Real login with JWT comes in M3.
// Each role acts as one user from db.json.
const DEMO_USER_ID: Record<Role, number> = { LIBRARIAN: 1, MEMBER: 2 }

export const useSessionStore = defineStore('session', () => {
  const role = ref<Role>('MEMBER')
  const userId = computed(() => DEMO_USER_ID[role.value])
  const isLibrarian = computed(() => role.value === 'LIBRARIAN')

  function setRole(r: Role) {
    role.value = r
  }

  return { role, userId, isLibrarian, setRole }
})
