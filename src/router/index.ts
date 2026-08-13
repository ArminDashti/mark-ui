import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import MarksView from '@/views/MarksView.vue'
import AboutMeView from '@/views/AboutMeView.vue'
import { getToken } from '@/lib/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/logos' },
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    {
      path: '/logos',
      name: 'logos',
      component: MarksView,
      props: { kind: 'logo' },
      meta: { requiresAuth: true },
    },
    {
      path: '/icons',
      name: 'icons',
      component: MarksView,
      props: { kind: 'icon' },
      meta: { requiresAuth: true },
    },
    { path: '/about-me', name: 'about-me', component: AboutMeView },
  ],
})

router.beforeEach((to) => {
  const token = getToken()
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && token) {
    return { name: 'logos' }
  }
  return true
})

export default router
