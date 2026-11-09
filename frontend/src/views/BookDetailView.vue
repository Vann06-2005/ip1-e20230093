<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useLoansStore } from '@/stores/loans'
import { useSessionStore } from '@/stores/session'

// With `props: true` in the route, the :id param arrives as a prop (a string)
const props = defineProps<{ id: string }>()
const router = useRouter()
const books = useBooksStore()
const loans = useLoansStore()
const { isLibrarian } = storeToRefs(useSessionStore())

const loading = ref(true)
const loadError = ref<string | null>(null)
const borrowError = ref<string | null>(null)
const pending = ref(false)
const bookId = computed(() => Number(props.id))
// Read from the store, so the available copies update after borrowing
const book = computed(() => books.byId(bookId.value))

async function load() {
  loading.value = true
  loadError.value = null
  try {
    await books.fetchOne(bookId.value)
  } catch (e) {
    loadError.value =
      e instanceof Error && e.message.includes('404') ? 'Book not found.' : String(e)
  } finally {
    loading.value = false
  }
}
// The same page is reused when only the :id changes, so watch it
watch(bookId, load, { immediate: true })

async function onBorrow() {
  if (!book.value) return
  pending.value = true
  borrowError.value = null
  try {
    await loans.borrow(book.value)
    router.push({ name: 'my-loans' })
  } catch (e) {
    borrowError.value = e instanceof Error ? e.message : 'Borrowing failed.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section>
    <RouterLink :to="{ name: 'catalogue' }">&larr; Back to the catalogue</RouterLink>

    <p v-if="loading" class="loading">Loading...</p>
    <div v-else-if="loadError" role="alert" class="error">
      <p>{{ loadError }}</p>
      <button type="button" @click="load">Try again</button>
    </div>

    <article v-else-if="book" class="book">
      <p class="genre">{{ book.genre.toLowerCase() }}</p>
      <h1>{{ book.title }}</h1>
      <p class="author">by {{ book.author }}</p>
      <dl>
        <dt>ISBN</dt>
        <dd>{{ book.isbn }}</dd>
        <dt>Published</dt>
        <dd>{{ book.publishedYear ?? 'Unknown' }}</dd>
        <dt>Copies</dt>
        <dd>{{ book.availableCopies }} of {{ book.totalCopies }} available</dd>
      </dl>
      <p v-if="book.description">{{ book.description }}</p>

      <!-- A librarian does not borrow; edit and delete come with the real API in M2 -->
      <div v-if="!isLibrarian" class="borrow">
        <button type="button" :disabled="pending || book.availableCopies === 0" @click="onBorrow">
          {{
            book.availableCopies === 0 ? 'No copies available' : pending ? 'Borrowing...' : 'Borrow'
          }}
        </button>
        <p v-if="borrowError" role="alert" class="error-text">{{ borrowError }}</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.book {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-top: 12px;
  max-width: 640px;
}
h1 {
  margin: 4px 0;
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
  margin: 0 0 12px;
}
dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 16px;
}
dt {
  font-weight: 600;
}
dd {
  margin: 0;
}
.borrow {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.loading {
  color: #6b7280;
}
.error {
  background: #fdecea;
  border: 1px solid #d73a49;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 12px;
}
.error-text {
  color: #d73a49;
  margin: 0;
}
</style>
