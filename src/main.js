import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter } from './router'

import App from './App.vue'

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
  const pinia = createPinia()

  app.use(router)
  app.use(pinia)

  return { app, router, pinia }
}
