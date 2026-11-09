import { computed, ref, type Ref } from 'vue'
import type { Book, Genre } from '@/types'

// Search and filters for the catalogue (US-03). Any page with a list of books can reuse it.
export function useBookFilters(books: Ref<Book[]>) {
  const search = ref('')
  const genre = ref<Genre | 'ALL'>('ALL')
  const availableOnly = ref(false)

  const visible = computed(() => {
    const q = search.value.trim().toLowerCase()
    return books.value.filter(
      (b) =>
        (genre.value === 'ALL' || b.genre === genre.value) &&
        (!availableOnly.value || b.availableCopies > 0) &&
        (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
    )
  })

  return { search, genre, availableOnly, visible }
}
