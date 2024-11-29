import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/default/index.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
      },
      {
        path: '/rank/daily',
        name: 'DailyRank',
        component: () => import('@/views/rank/daily/index.vue'),
      },
      {
        path: '/rank/weekly',
        name: 'WeeklyRank',
        component: () => import('@/views/rank/weekly/index.vue'),
      },
      {
        path: '/system/user',
        name: 'UserManage',
        component: () => import('@/views/system/user/index.vue'),
      },
      {
        path: '/system/role',
        name: 'RoleManage',
        component: () => import('@/views/system/role/index.vue'),
      },
      {
        path: '/system/menu',
        name: 'MenuManage',
        component: () => import('@/views/system/menu/index.vue'),
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    if (token) {
      // 如果有token但没有用户信息，尝试获取用户信息
      if (!userStore.userInfo) {
        try {
          const hasState = await userStore.initState()
          if (hasState) {
            next()
          } else {
            next('/login')
          }
        } catch (error) {
          next('/login')
        }
      } else {
        next()
      }
    } else {
      next('/login')
    }
  }
})

export default router 
