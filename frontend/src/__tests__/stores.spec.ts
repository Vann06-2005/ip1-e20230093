import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBooksStore } from '@/stores/books'
import { useLoansStore } from '@/stores/loans'
import { bookRecords, mockFetch } from './helpers'

beforeEach(() => setActivePinia(createPinia()))

describe('books store', () => {
  it('fetchAll goes loading -> success and calculates the available copies', async () => {
    mockFetch({ 'GET /books': bookRecords })
    const store = useBooksStore()
    expect(store.status).toBe('idle')
    const p = store.fetchAll()
    expect(store.status).toBe('loading')
    await p
    expect(store.status).toBe('success')
    expect(store.books).toHaveLength(3)
    expect(store.byId(1)?.availableCopies).toBe(2) // 3 copies, 1 on loan
    expect(store.byId(4)?.availableCopies).toBe(0)
  })

  it('fetchAll goes to error with a message when the API fails', async () => {
    mockFetch({ 'GET /books': 500 })
    const store = useBooksStore()
    await store.fetchAll()
    expect(store.status).toBe('error')
    expect(store.error).toContain('500')
    expect(store.books).toEqual([])
  })
})

describe('loans store', () => {
  it('refuses to borrow a book with no copy left, without calling POST', async () => {
    const calls = mockFetch({ 'GET /books': bookRecords, 'GET /loans': [] })
    const books = useBooksStore()
    await books.fetchAll()
    const loans = useLoansStore()
    await expect(loans.borrow(books.byId(4)!)).rejects.toThrow(
      'No copies of this book are available.',
    )
    expect(calls.some((c) => c.method === 'POST')).toBe(false)
  })

  it('borrows a book: POST the loan due 14 days later, then reload the book', async () => {
    const calls = mockFetch({
      'GET /books': bookRecords,
      'GET /loans': [],
      'POST /loans': (b: unknown) => ({ id: 9, ...(b as object) }),
      'GET /books/5': {
        ...bookRecords[2]!,
        loans: [{ id: 9, userId: 2, bookId: 5, borrowedAt: '', dueDate: '', returnedAt: null }],
      },
    })
    const books = useBooksStore()
    await books.fetchAll()
    await useLoansStore().borrow(books.byId(5)!)
    const post = calls.find((c) => c.method === 'POST')!
    expect(post.body).toMatchObject({ userId: 2, bookId: 5, returnedAt: null })
    const { borrowedAt, dueDate } = post.body as { borrowedAt: string; dueDate: string }
    expect(new Date(dueDate).getTime() - new Date(borrowedAt).getTime()).toBe(
      14 * 24 * 60 * 60 * 1000,
    )
    expect(books.byId(5)?.availableCopies).toBe(3)
  })
})
