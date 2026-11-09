<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { GENRES } from '@/types'
import type { BookInput, Genre } from '@/types'
import { hasErrors, validateBook } from '@/validation'

defineProps<{ pending?: boolean }>()
const emit = defineEmits<{ submit: [input: BookInput] }>()

const form = reactive({
  title: '',
  author: '',
  isbn: '',
  genre: 'FICTION' as Genre,
  publishedYear: '' as number | '', // an empty number input gives ''
  description: '',
  totalCopies: 1,
})
const submitted = ref(false)

// The cleaned values: trimmed text, and null when no year was typed
const input = computed<BookInput>(() => ({
  title: form.title.trim(),
  author: form.author.trim(),
  isbn: form.isbn.trim(),
  genre: form.genre,
  publishedYear: form.publishedYear === '' ? null : form.publishedYear,
  description: form.description.trim(),
  totalCopies: form.totalCopies,
}))
const errors = computed(() => validateBook(input.value))

function onSubmit() {
  submitted.value = true
  if (!hasErrors(errors.value)) emit('submit', input.value)
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <label>Title <input v-model="form.title" name="title" /></label>
    <p v-if="submitted && errors.title" class="error">{{ errors.title }}</p>

    <label>Author <input v-model="form.author" name="author" /></label>
    <p v-if="submitted && errors.author" class="error">{{ errors.author }}</p>

    <label>ISBN <input v-model="form.isbn" name="isbn" inputmode="numeric" /></label>
    <p v-if="submitted && errors.isbn" class="error">{{ errors.isbn }}</p>

    <label>
      Genre
      <select v-model="form.genre" name="genre">
        <option v-for="g in GENRES" :key="g" :value="g">{{ g.toLowerCase() }}</option>
      </select>
    </label>
    <p v-if="submitted && errors.genre" class="error">{{ errors.genre }}</p>

    <label>
      Published year (optional)
      <input v-model.number="form.publishedYear" name="publishedYear" type="number" />
    </label>
    <p v-if="submitted && errors.publishedYear" class="error">{{ errors.publishedYear }}</p>

    <label>
      Description (optional)
      <textarea v-model="form.description" name="description" rows="4" />
    </label>
    <p v-if="submitted && errors.description" class="error">{{ errors.description }}</p>

    <label>
      Total copies
      <input v-model.number="form.totalCopies" name="totalCopies" type="number" min="0" max="100" />
    </label>
    <p v-if="submitted && errors.totalCopies" class="error">{{ errors.totalCopies }}</p>

    <button type="submit" :disabled="pending">{{ pending ? 'Saving...' : 'Add book' }}</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 480px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 600;
}
.error {
  color: #d73a49;
  margin: 0;
  font-size: 0.9rem;
}
button {
  align-self: flex-start;
  margin-top: 8px;
}
</style>
