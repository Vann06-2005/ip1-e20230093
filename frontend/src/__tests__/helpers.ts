import { vi } from 'vitest'
import type { Book, Loan } from '@/types'

type Handler = unknown | number | ((body: unknown) => unknown)
export interface Call {
  method: string
  path: string
  body: unknown
}

// Fakes fetch: "GET /books" -> a value to return, a status number to fail with,
// or a function of the request body. The query string is ignored when matching.
export function mockFetch(routes: Record<string, Handler>): Call[] {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const method = init.method ?? 'GET'
      const path = new URL(url).pathname
      const body = init.body ? JSON.parse(String(init.body)) : undefined
      calls.push({ method, path, body })
      const handler = routes[`${method} ${path}`]
      if (handler === undefined)
        return new Response('Not found', { status: 404, statusText: 'Not Found' })
      if (typeof handler === 'number')
        return new Response('', { status: handler, statusText: 'Error' })
      const data = typeof handler === 'function' ? handler(body) : handler
      return new Response(JSON.stringify(data), { status: 200 })
    }),
  )
  return calls
}

// What json-server sends for /books?_embed=loans
export const bookRecords: (Omit<Book, 'availableCopies'> & { loans: Loan[] })[] = [
  {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    genre: 'TECHNOLOGY',
    publishedYear: 2008,
    description: '',
    totalCopies: 3,
    loans: [
      {
        id: 1,
        userId: 2,
        bookId: 1,
        borrowedAt: '2026-11-02T09:00:00.000Z',
        dueDate: '2026-11-16T09:00:00.000Z',
        returnedAt: null,
      },
    ],
  },
  {
    id: 4,
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    isbn: '9780135957059',
    genre: 'TECHNOLOGY',
    publishedYear: 2019,
    description: '',
    totalCopies: 1,
    loans: [
      {
        id: 3,
        userId: 3,
        bookId: 4,
        borrowedAt: '2026-10-05T09:00:00.000Z',
        dueDate: '2026-10-19T09:00:00.000Z',
        returnedAt: null,
      },
    ],
  },
  {
    id: 5,
    title: "Harry Potter and the Philosopher's Stone",
    author: 'J. K. Rowling',
    isbn: '9780747532699',
    genre: 'FICTION',
    publishedYear: 1997,
    description: '',
    totalCopies: 4,
    loans: [],
  },
]
