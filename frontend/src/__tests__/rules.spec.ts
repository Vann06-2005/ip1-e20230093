import { describe, expect, it } from 'vitest'
import { daysLate, dueDateFrom, loanStatus } from '@/rules'
import type { Loan } from '@/types'

const loan: Loan = {
  id: 1,
  userId: 2,
  bookId: 1,
  borrowedAt: '2026-11-01T09:00:00.000Z',
  dueDate: '2026-11-15T09:00:00.000Z',
  returnedAt: null,
}

describe('loan rules', () => {
  it('a loan is due 14 days after it is borrowed', () => {
    expect(dueDateFrom(new Date('2026-11-01T09:00:00.000Z'))).toBe('2026-11-15T09:00:00.000Z')
  })

  it('calculates the status from the dates', () => {
    expect(loanStatus(loan, new Date('2026-11-10'))).toBe('ACTIVE')
    expect(loanStatus(loan, new Date('2026-11-18T09:00:00.000Z'))).toBe('OVERDUE')
    expect(
      loanStatus({ ...loan, returnedAt: '2026-11-20T00:00:00.000Z' }, new Date('2026-11-25')),
    ).toBe('RETURNED')
  })

  it('counts the days late', () => {
    expect(daysLate(loan, new Date('2026-11-18T09:00:00.000Z'))).toBe(3)
    expect(daysLate(loan, new Date('2026-11-10'))).toBe(0)
  })
})
