<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLoansStore } from '@/stores/loans'
import { daysLate, formatDate, loanStatus } from '@/rules'
import type { LoanWithBook } from '@/types'
import StatusMessage from '@/components/StatusMessage.vue'

const store = useLoansStore()
const { mine, status, error } = storeToRefs(store)
const returning = ref<number | null>(null)
const returnError = ref<string | null>(null)

onMounted(() => store.fetchMine())

async function onReturn(loan: LoanWithBook) {
  returning.value = loan.id
  returnError.value = null
  try {
    await store.giveBack(loan)
  } catch (e) {
    returnError.value = e instanceof Error ? e.message : 'Could not return the book.'
  } finally {
    returning.value = null
  }
}
</script>

<template>
  <section>
    <h1>My loans</h1>
    <StatusMessage :status="status" :error="error" @retry="store.fetchMine()" />
    <p v-if="returnError" role="alert" class="error-text">{{ returnError }}</p>

    <template v-if="status === 'success'">
      <p v-if="mine.length === 0" class="empty">You have not borrowed any books yet.</p>
      <table v-else>
        <thead>
          <tr>
            <th>Book</th>
            <th>Borrowed</th>
            <th>Due</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in mine" :key="loan.id" :class="loanStatus(loan).toLowerCase()">
            <td>
              <RouterLink :to="{ name: 'book-detail', params: { id: loan.bookId } }">
                {{ loan.book.title }}
              </RouterLink>
            </td>
            <td>{{ formatDate(loan.borrowedAt) }}</td>
            <td>{{ formatDate(loan.dueDate) }}</td>
            <td>
              {{ loanStatus(loan) }}
              <span v-if="loanStatus(loan) === 'OVERDUE'">({{ daysLate(loan) }} days late)</span>
            </td>
            <td>
              <button
                v-if="loan.returnedAt === null"
                type="button"
                :disabled="returning === loan.id"
                @click="onReturn(loan)"
              >
                {{ returning === loan.id ? 'Returning...' : 'Return' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </section>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
}
th,
td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
}
tr.overdue td {
  color: #d73a49;
}
tr.returned td {
  color: #6b7280;
}
.empty {
  padding: 32px;
  text-align: center;
  background: white;
  border-radius: 10px;
}
.error-text {
  color: #d73a49;
}
</style>
