import { describe, expect, it } from 'vitest'
import { hasErrors, validateBook } from '@/validation'
import type { BookInput } from '@/types'

const ok: BookInput = {
  title: 'Clean Code',
  author: 'Robert C. Martin',
  isbn: '9780132350884',
  genre: 'TECHNOLOGY',
  publishedYear: 2008,
  description: '',
  totalCopies: 3,
}

describe('validateBook', () => {
  it('accepts a valid book, with or without a year', () => {
    expect(validateBook(ok, 2026)).toEqual({})
    expect(validateBook({ ...ok, publishedYear: null }, 2026)).toEqual({})
  })

  it('requires a title and an author', () => {
    const errors = validateBook({ ...ok, title: '  ', author: '' }, 2026)
    expect(errors.title).toBe('Title is required.')
    expect(errors.author).toBe('Author is required.')
  })

  it('accepts only a 10 or 13 digit ISBN', () => {
    expect(validateBook({ ...ok, isbn: '0132350882' }, 2026).isbn).toBeUndefined()
    expect(validateBook({ ...ok, isbn: '978-0132350884' }, 2026).isbn).toBe(
      'ISBN must be 10 or 13 digits.',
    )
    expect(validateBook({ ...ok, isbn: '12345' }, 2026).isbn).toBeDefined()
  })

  it('keeps total copies between 0 and 100 and the year between 1450 and now', () => {
    expect(validateBook({ ...ok, totalCopies: 0 }, 2026).totalCopies).toBeUndefined()
    expect(validateBook({ ...ok, totalCopies: 101 }, 2026).totalCopies).toBeDefined()
    expect(validateBook({ ...ok, totalCopies: 1.5 }, 2026).totalCopies).toBeDefined()
    expect(validateBook({ ...ok, publishedYear: 2027 }, 2026).publishedYear).toBe(
      'Year must be between 1450 and 2026.',
    )
  })

  it('hasErrors tells whether an errors object is empty', () => {
    expect(hasErrors({})).toBe(false)
    expect(hasErrors({ title: 'x' })).toBe(true)
  })
})
