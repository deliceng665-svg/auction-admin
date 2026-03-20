import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '数据概览' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/Products.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'products/add',
        name: 'ProductAdd',
        component: () => import('../views/ProductAdd.vue'),
        meta: { title: '发布商品' }
      },
      {
        path: 'products/edit/:id',
        name: 'ProductEdit',
        component: () => import('../views/ProductAdd.vue'),
        meta: { title: '编辑商品' }
      },
      {
        path: 'auction',
        name: 'Auction',
        component: () => import('../views/Auction.vue'),
        meta: { title: '竞拍管理' }
      },
      {
        path: 'auction/:id',
        name: 'AuctionDetail',
        component: () => import('../views/AuctionDetail.vue'),
        meta: { title: '竞拍详情' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'deposits',
        name: 'Deposits',
        component: () => import('../views/Deposits.vue'),
        meta: { title: '保证金管理' }
      },
      {
        path: 'earnings',
        name: 'Earnings',
        component: () => import('../views/Earnings.vue'),
        meta: { title: '收益明细' }
      },
      {
        path: 'withdraw',
        name: 'Withdraw',
        component: () => import('../views/Withdraw.vue'),
        meta: { title: '提现' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
