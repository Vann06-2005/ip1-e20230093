<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useBookFilters } from '@/composables/useBookFilters'
import { GENRES } from '@/types'
import BookCard from '@/components/BookCard.vue'
import StatusMessage from '@/components/StatusMessage.vue'

const store = useBooksStore()
// storeToRefs keeps the values linked to the store when they are taken out of it
const { books, status, error } = storeToRefs(store)
const { search, genre, availableOnly, visible } = useBookFilters(books)
const route = useRoute()

onMounted(() => {
  if (status.value !== 'success') store.fetchAll()
})
</script>

<template>
  <section>
    <h1>Catalogue</h1>
    <p v-if="route.query.denied" role="status" class="denied">
      That page is not available for your role.
    </p>

    <StatusMessage :status="status" :error="error" @retry="store.fetchAll()" />

    <template v-if="status === 'success'">
      <p v-if="books.length === 0" class="empty">There are no books in the catalogue yet.</p>
      <template v-else>
        <div class="filters">
          <input
            v-model="search"
            type="search"
            placeholder="Search title or author"
            aria-label="Search"
          />
          <select v-model="genre" aria-label="Genre">
            <option value="ALL">All genres</option>
            <option v-for="g in GENRES" :key="g" :value="g">{{ g.toLowerCase() }}</option>
          </select>
          <label><input v-model="availableOnly" type="checkbox" /> Available only</label>
        </div>

        <p class="count">{{ visible.length }} of {{ books.length }} books</p>
        <div v-if="visible.length" class="grid">
          <BookCard v-for="b in visible" :key="b.id" :book="b" />
        </div>
        <p v-else class="empty">No books found.</p>
      </template>
    </template>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.filters input[type='search'] {
  flex: 1;
  min-width: 200px;
}
.count {
  color: #6b7280;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.empty {
  padding: 32px;
  text-align: center;
  background: white;
  border-radius: 10px;
}
.denied {
  background: #fff4e5;
  border-radius: 8px;
  padding: 8px 12px;
}
</style>
