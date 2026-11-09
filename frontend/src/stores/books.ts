import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { booksApi } from '@/api/books'
import type { Book, BookInput } from '@/types'

export type Status = 'idle' | 'loading' | 'error' | 'success'

export const useBooksStore = defineStore('books', () => {
  // state
  const books = ref<Book[]>([])
  const status = ref<Status>('idle')
  const error = ref<string | null>(null)

  // getters
  const byId = computed(() => (id: number) => books.value.find((b) => b.id === id))

  // actions
  async function fetchAll() {
    status.value = 'loading'
    error.value = null
    try {
      books.value = await booksApi.list()
      status.value = 'success'
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      status.value = 'error'
    }
  }

  // Use the cached book if we have it, otherwise ask the API
  async function fetchOne(id: number): Promise<Book> {
    const cached = byId.value(id)
    if (cached) return cached
    const book = await booksApi.get(id)
    replace(book)
    return book
  }

  // Load one book again, after a loan changed its available copies
  async function refresh(id: number): Promise<Book> {
    const book = await booksApi.get(id)
    replace(book)
    return book
  }

  async function create(input: BookInput): Promise<Book> {
    const created = await booksApi.create(input)
    books.value.push(created)
    return created
  }

  function replace(updated: Book) {
    const i = books.value.findIndex((b) => b.id === updated.id)
    if (i === -1) books.value.push(updated)
    else books.value[i] = updated
  }

  return { books, status, error, byId, fetchAll, fetchOne, refresh, create, replace }
})
