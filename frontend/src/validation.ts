import { GENRES } from './types'
import type { BookInput, FormErrors } from './types'

const ISBN = /^(\d{10}|\d{13})$/

// Client-side rules for the book form, from US-07 in docs/SPEC.md.
// They give quick feedback; the API checks the same rules again from M2.
export function validateBook(
  form: BookInput,
  currentYear = new Date().getFullYear(),
): FormErrors<BookInput> {
  const errors: FormErrors<BookInput> = {}
  const title = form.title.trim()
  const author = form.author.trim()

  if (title === '') errors.title = 'Title is required.'
  else if (title.length > 200) errors.title = 'Title must be at most 200 characters.'

  if (author === '') errors.author = 'Author is required.'
  else if (author.length > 100) errors.author = 'Author must be at most 100 characters.'

  if (!ISBN.test(form.isbn.trim())) errors.isbn = 'ISBN must be 10 or 13 digits.'

  if (!GENRES.includes(form.genre)) errors.genre = 'Choose a genre.'

  const year = form.publishedYear
  if (year !== null && (!Number.isInteger(year) || year < 1450 || year > currentYear))
    errors.publishedYear = `Year must be between 1450 and ${currentYear}.`

  if (form.description.length > 1000)
    errors.description = 'Keep the description under 1000 characters.'

  if (!Number.isInteger(form.totalCopies) || form.totalCopies < 0 || form.totalCopies > 100)
    errors.totalCopies = 'Total copies must be a whole number from 0 to 100.'

  return errors
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0
