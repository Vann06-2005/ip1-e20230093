<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import type { Role } from '@/types'

const session = useSessionStore()
const { role, isLibrarian } = storeToRefs(session)
const router = useRouter()

// Switching role leaves pages the new role cannot see
function onRoleChange(event: Event) {
  session.setRole((event.target as HTMLSelectElement).value as Role)
  router.push({ name: 'catalogue' })
}
</script>

<template>
  <header>
    <RouterLink :to="{ name: 'catalogue' }" class="brand">Library Loans</RouterLink>
    <nav>
      <RouterLink :to="{ name: 'catalogue' }">Catalogue</RouterLink>
      <RouterLink v-if="!isLibrarian" :to="{ name: 'my-loans' }">My loans</RouterLink>
      <RouterLink v-if="isLibrarian" :to="{ name: 'book-new' }">Add book</RouterLink>
    </nav>
    <label class="role">
      Role
      <select :value="role" aria-label="Role" @change="onRoleChange">
        <option value="MEMBER">Member</option>
        <option value="LIBRARIAN">Librarian</option>
      </select>
    </label>
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  padding: 12px 0 20px;
}
.brand {
  font-weight: 700;
  font-size: 1.2rem;
  color: #2f6f4f;
  text-decoration: none;
}
nav {
  display: flex;
  gap: 16px;
  flex: 1;
}
nav a.router-link-exact-active {
  font-weight: 700;
}
.role {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
