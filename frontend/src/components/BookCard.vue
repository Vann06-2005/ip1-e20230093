<script setup lang="ts">
import { computed } from 'vue'
import type { Book } from '@/types'

const props = defineProps<{ book: Book }>()
const available = computed(() => props.book.availableCopies > 0)
</script>

<template>
  <article class="card">
    <p class="genre">{{ book.genre.toLowerCase() }}</p>
    <h2>
      <RouterLink :to="{ name: 'book-detail', params: { id: book.id } }">{{
        book.title
      }}</RouterLink>
    </h2>
    <p class="author">{{ book.author }}</p>
    <p :class="available ? 'copies' : 'copies none'">
      {{
        available
          ? `${book.availableCopies} of ${book.totalCopies} available`
          : 'No copies available'
      }}
    </p>
  </article>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
h2 {
  font-size: 1.05rem;
  margin: 0;
}
.genre {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: #2f6f4f;
  margin: 0;
}
.author {
  color: #6b7280;
  margin: 0;
}
.copies {
  margin: 0;
  font-weight: 600;
}
.copies.none {
  color: #d73a49;
}
</style>
