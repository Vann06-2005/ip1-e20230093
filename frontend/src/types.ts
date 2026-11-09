export type Role = 'MEMBER' | 'LIBRARIAN'

export const GENRES = ['FICTION', 'SCIENCE', 'TECHNOLOGY', 'HISTORY', 'LANGUAGE', 'OTHER'] as const
export type Genre = (typeof GENRES)[number]

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface Book {
  id: number
  title: string
  author: string
  isbn: string
  genre: Genre
  publishedYear: number | null
  description: string
  totalCopies: number
  availableCopies: number // calculated: total copies minus active loans, never stored
}

// What the "add book" form sends: the server gives the id, and nobody has borrowed it yet
export type BookInput = Omit<Book, 'id' | 'availableCopies'>

export interface Loan {
  id: number
  userId: number
  bookId: number
  borrowedAt: string // ISO date, e.g. "2026-11-02T09:00:00.000Z"
  dueDate: string
  returnedAt: string | null // null while the book is still borrowed
}

// A loan with its book's title, for the My loans page
export interface LoanWithBook extends Loan {
  book: Pick<Book, 'id' | 'title' | 'author'>
}

export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED'

// Field name -> error message, only for fields that have an error
export type FormErrors<T> = Partial<Record<keyof T, string>>
