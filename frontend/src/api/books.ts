import { request } from './http'
import type { Book, BookInput, Loan } from '@/types'

// json-server stores books without availableCopies. `_embed=loans` adds each book's loans,
// and toBook turns them into the count the real API will return from M2.
type BookRecord = Omit<Book, 'availableCopies'> & { loans?: Loan[] }

function toBook({ loans = [], ...book }: BookRecord): Book {
  const onLoan = loans.filter((l) => l.returnedAt === null).length
  return { ...book, availableCopies: Math.max(0, book.totalCopies - onLoan) }
}

export const booksApi = {
  list: () => request<BookRecord[]>('/books?_embed=loans&_sort=title').then((bs) => bs.map(toBook)),
  get: (id: number) => request<BookRecord>(`/books/${id}?_embed=loans`).then(toBook),
  create: (input: BookInput) =>
    request<BookRecord>('/books', { method: 'POST', body: JSON.stringify(input) }).then(toBook),
}
