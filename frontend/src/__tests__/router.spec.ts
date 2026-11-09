import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { makeRouter } from '@/router'
import { useSessionStore } from '@/stores/session'

beforeEach(() => setActivePinia(createPinia()))

describe('router', () => {
  it('matches the detail route and passes the id', async () => {
    const router = makeRouter(createMemoryHistory())
    await router.push('/books/3')
    expect(router.currentRoute.value.name).toBe('book-detail')
    expect(router.currentRoute.value.params.id).toBe('3')
  })

  it('sends unknown paths and non-number ids to the 404 page', async () => {
    const router = makeRouter(createMemoryHistory())
    await router.push('/nope')
    expect(router.currentRoute.value.name).toBe('not-found')
    await router.push('/books/abc')
    expect(router.currentRoute.value.name).toBe('not-found')
  })

  it('only a librarian can open /books/new, and only a member /my-loans', async () => {
    const router = makeRouter(createMemoryHistory())
    await router.push('/books/new')
    expect(router.currentRoute.value.name).toBe('catalogue')
    expect(router.currentRoute.value.query.denied).toBe('1')

    useSessionStore().setRole('LIBRARIAN')
    await router.push('/books/new')
    expect(router.currentRoute.value.name).toBe('book-new')
    await router.push('/my-loans')
    expect(router.currentRoute.value.name).toBe('catalogue')
  })
})
