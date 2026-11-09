<script setup lang="ts">
import type { Status } from '@/stores/books'

// Shows the loading and error states of a page. Empty and success are shown by the page itself.
defineProps<{ status: Status; error: string | null }>()
const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <p v-if="status === 'loading' || status === 'idle'" class="loading">Loading...</p>
  <div v-else-if="status === 'error'" role="alert" class="error">
    <p>{{ error }}</p>
    <button type="button" @click="emit('retry')">Try again</button>
  </div>
</template>

<style scoped>
.loading {
  color: #6b7280;
}
.error {
  background: #fdecea;
  border: 1px solid #d73a49;
  border-radius: 8px;
  padding: 12px 16px;
}
.error p {
  margin: 0 0 8px;
}
</style>
