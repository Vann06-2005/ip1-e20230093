import type { Loan, LoanStatus } from './types'

// Loan rules from docs/SPEC.md, defined once. The backend will check them again from M2.
export const MAX_ACTIVE_LOANS = 3
export const LOAN_DAYS = 14

const DAY_MS = 24 * 60 * 60 * 1000

export function dueDateFrom(borrowedAt: Date): string {
  return new Date(borrowedAt.getTime() + LOAN_DAYS * DAY_MS).toISOString()
}

// The status is calculated from the dates, not stored
export function loanStatus(loan: Loan, now = new Date()): LoanStatus {
  if (loan.returnedAt !== null) return 'RETURNED'
  return new Date(loan.dueDate) < now ? 'OVERDUE' : 'ACTIVE'
}

export function daysLate(loan: Loan, now = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(loan.dueDate).getTime()) / DAY_MS))
}

// "Mon 2 Nov 2026" in UTC, so the output is the same on every machine
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
