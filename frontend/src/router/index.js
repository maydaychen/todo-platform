import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import DailyTasks from '../views/DailyTasks.vue'
import CreativeTasks from '../views/CreativeTasks.vue'
import Settings from '../views/Settings.vue'
import AISettings from '../views/AISettings.vue'
import Categories from '../views/Categories.vue'
import CategoryPrompts from '../views/CategoryPrompts.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/daily',
    name: 'DailyTasks',
    component: DailyTasks,
    meta: { requiresAuth: true }
  },
  {
    path: '/creative',
    name: 'CreativeTasks',
    component: CreativeTasks,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/ai',
    name: 'AISettings',
    component: AISettings,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
    meta: { requiresAuth: true }
  },
  {
    path: '/category-prompts',
    name: 'CategoryPrompts',
    component: CategoryPrompts,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('todo_token')
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth && !token) {
    // 需要登录但没有 token，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录但访问登录页，跳转到首页
    next('/')
  } else {
    next()
  }
})

export default router
