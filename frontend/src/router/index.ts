import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import type { Role } from '@/types'
import CatalogueView from '@/views/CatalogueView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    role?: Role // only this role may open the page
  }
}

export const routes = [
  { path: '/', redirect: '/books' },
  { path: '/books', name: 'catalogue', component: CatalogueView },
  {
    path: '/books/new',
    name: 'book-new',
    component: () => import('@/views/BookFormView.vue'),
    meta: { role: 'LIBRARIAN' as const },
  },
  // Only digits match, so /books/abc goes to the 404 page
  {
    path: '/books/:id(\\d+)',
    name: 'book-detail',
    component: () => import('@/views/BookDetailView.vue'),
    props: true,
  },
  {
    path: '/my-loans',
    name: 'my-loans',
    component: () => import('@/views/MyLoansView.vue'),
    meta: { role: 'MEMBER' as const },
  },
  // Anything else; it must stay last
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

export function makeRouter(history: RouterHistory = createWebHistory(import.meta.env.BASE_URL)) {
  const router = createRouter({ history, routes })

  // A page for one role sends the other role back to the catalogue.
  // This only hides pages: the API must check the role again from M3.
  router.beforeEach((to) => {
    if (to.meta.role && useSessionStore().role !== to.meta.role) {
      return { name: 'catalogue', query: { denied: '1' } }
    }
  })

  return router
}

export default makeRouter()
