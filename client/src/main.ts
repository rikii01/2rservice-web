import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import LandingPage from './views/LandingPage.vue'
import LoginPage from './views/LoginPage.vue'
import RegisterPage from './views/RegisterPage.vue'
import DashboardPage from './views/DashboardPage.vue'
import CatalogPage from './views/CatalogPage.vue'
import QueuePage from './views/QueuePage.vue'
import AdminQueuePage from './views/AdminQueuePage.vue'
import AdminFinancePage from './views/AdminFinancePage.vue'
import ProfilePage from './views/ProfilePage.vue'
import { useAuth } from './composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LandingPage, name: 'home' },
    { path: '/login', component: LoginPage, name: 'login' },
    { path: '/register', component: RegisterPage, name: 'register' },
    { path: '/dashboard', component: DashboardPage, name: 'dashboard' },
    { path: '/catalog', component: CatalogPage, name: 'catalog' },
    { path: '/queue', component: QueuePage, name: 'queue' },
    { path: '/profile', component: ProfilePage, name: 'profile' },
    { path: '/admin/queues', component: AdminQueuePage, name: 'admin-queues' },
    { path: '/admin/finance', component: AdminFinancePage, name: 'admin-finance' },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const { isAuthenticated, isAdmin } = useAuth()
  const protectedRoutes = ['dashboard', 'catalog', 'queue', 'profile', 'admin-queues', 'admin-finance']

  if (protectedRoutes.includes(to.name as string) && !isAuthenticated.value) {
    next({ name: 'login' })
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated.value) {
    next({ name: 'dashboard' })
  } else if ((to.name === 'admin-queues' || to.name === 'admin-finance') && !isAdmin.value) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')

