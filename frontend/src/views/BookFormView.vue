<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import type { BookInput } from '@/types'
import BookForm from '@/components/BookForm.vue'

const store = useBooksStore()
const router = useRouter()
const pending = ref(false)
const error = ref<string | null>(null)

async function onSubmit(input: BookInput) {
  pending.value = true
  error.value = null
  try {
    const created = await store.create(input)
    router.push({ name: 'book-detail', params: { id: created.id } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not add the book.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section>
    <h1>Add a book</h1>
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <BookForm :pending="pending" @submit="onSubmit" />
  </section>
</template>

<style scoped>
.error {
  color: #d73a49;
}
</style>
