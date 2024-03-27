import { createRouter as _createRouter, createMemoryHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/printPDF'
  },
  {
    path: '/printPDF',
    name: 'printPDF',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/IndexView.vue')
  }
]

export function createRouter() {
  return _createRouter({
    history: createMemoryHistory(import.meta.env.BASE_URL),
    routes: routes,
  })
}
