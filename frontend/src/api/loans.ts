import { request } from './http'
import type { Loan, LoanWithBook } from '@/types'

export const loansApi = {
  // `_expand=book` adds the loan's book, so My loans can show its title
  listForUser: (userId: number) =>
    request<LoanWithBook[]>(`/loans?userId=${userId}&_expand=book&_sort=borrowedAt&_order=desc`),
  create: (loan: Omit<Loan, 'id'>) =>
    request<Loan>('/loans', { method: 'POST', body: JSON.stringify(loan) }),
  markReturned: (id: number, returnedAt: string) =>
    request<Loan>(`/loans/${id}`, { method: 'PATCH', body: JSON.stringify({ returnedAt }) }),
}
