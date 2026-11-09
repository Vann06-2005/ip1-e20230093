import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loansApi } from '@/api/loans'
import { ApiError } from '@/api/http'
import { dueDateFrom, loanStatus, MAX_ACTIVE_LOANS } from '@/rules'
import type { Book, Loan, LoanWithBook } from '@/types'
import { useBooksStore } from './books'
import { useSessionStore } from './session'
import type { Status } from './books'

export const useLoansStore = defineStore('loans', () => {
  const mine = ref<LoanWithBook[]>([])
  const status = ref<Status>('idle')
  const error = ref<string | null>(null)

  const activeCount = computed(() => mine.value.filter((l) => l.returnedAt === null).length)

  // The current member's loans, newest first
  async function fetchMine() {
    status.value = 'loading'
    error.value = null
    try {
      mine.value = await loansApi.listForUser(useSessionStore().userId)
      status.value = 'success'
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      status.value = 'error'
    }
  }

  // Business rules BR-1 to BR-4 from docs/SPEC.md, checked in that order.
  // The API must check them again from M2: anyone can skip this page and call the API directly.
  function borrowProblem(book: Book, now = new Date()): string | null {
    const active = mine.value.filter((l) => l.returnedAt === null)
    if (active.some((l) => l.bookId === book.id)) return 'You already borrowed this book.'
    if (active.some((l) => loanStatus(l, now) === 'OVERDUE'))
      return 'Return your overdue books before borrowing a new one.'
    if (active.length >= MAX_ACTIVE_LOANS)
      return `You can borrow at most ${MAX_ACTIVE_LOANS} books at a time.`
    if (book.availableCopies === 0) return 'No copies of this book are available.'
    return null
  }

  async function borrow(book: Book): Promise<Loan> {
    if (status.value !== 'success') await fetchMine()
    const problem = borrowProblem(book)
    if (problem) throw new ApiError(400, problem)

    const now = new Date()
    const loan = await loansApi.create({
      userId: useSessionStore().userId,
      bookId: book.id,
      borrowedAt: now.toISOString(),
      dueDate: dueDateFrom(now),
      returnedAt: null,
    })
    // One less copy on the shelf: reload the book and my loans
    await useBooksStore().refresh(book.id)
    await fetchMine()
    return loan
  }

  async function giveBack(loan: Loan) {
    if (loan.returnedAt !== null) throw new ApiError(400, 'This loan is already returned.')
    const updated = await loansApi.markReturned(loan.id, new Date().toISOString())
    const i = mine.value.findIndex((l) => l.id === loan.id)
    const current = mine.value[i]
    if (current) mine.value[i] = { ...current, returnedAt: updated.returnedAt }
    await useBooksStore().refresh(loan.bookId)
  }

  return { mine, status, error, activeCount, fetchMine, borrowProblem, borrow, giveBack }
})
