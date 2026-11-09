import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'
import { makeRouter } from '@/router'
import App from '@/App.vue'
import { bookRecords, mockFetch } from './helpers'

async function mountApp(path = '/books') {
  const router = makeRouter(createMemoryHistory())
  router.push(path)
  await router.isReady()
  return mount(App, { global: { plugins: [createPinia(), router] } })
}

describe('Catalogue page', () => {
  it('shows loading, then the books with links to their page', async () => {
    mockFetch({ 'GET /books': bookRecords })
    const w = await mountApp()
    expect(w.text()).toContain('Loading...')
    await flushPromises()
    expect(w.findAll('article')).toHaveLength(3)
    expect(w.find('article a').attributes('href')).toBe('/books/1')
    expect(w.text()).toContain('No copies available')
  })

  it('searches by title or author, ignoring case, and shows an empty result', async () => {
    mockFetch({ 'GET /books': bookRecords })
    const w = await mountApp()
    await flushPromises()
    await w.find('input[type=search]').setValue('ROWLING')
    expect(w.findAll('article')).toHaveLength(1)
    await w.find('input[type=search]').setValue('zzz')
    expect(w.text()).toContain('No books found.')
  })

  it('shows an empty catalogue', async () => {
    mockFetch({ 'GET /books': [] })
    const w = await mountApp()
    await flushPromises()
    expect(w.text()).toContain('There are no books in the catalogue yet.')
  })

  it('shows an error with a retry button that loads again', async () => {
    const routes: Record<string, unknown> = { 'GET /books': 503 }
    mockFetch(routes)
    const w = await mountApp()
    await flushPromises()
    expect(w.find('[role=alert]').text()).toContain('503')
    routes['GET /books'] = bookRecords
    await w.find('[role=alert] button').trigger('click')
    await flushPromises()
    expect(w.findAll('article')).toHaveLength(3)
  })
})
