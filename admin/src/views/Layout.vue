<template>
  <div class="admin-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span>竞拍商家后台</span>
      </div>

      <nav class="sidebar-menu">
        <router-link
          v-for="item in menuList"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- 右侧内容 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <header class="top-header">
        <div class="header-title">{{ currentTitle }}</div>
        <div class="header-user">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32">商</el-avatar>
              <span class="username">商家账号</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { logout } from '../api'

const router = useRouter()
const route = useRoute()

const menuList = [
  { path: '/dashboard', title: '数据概览', icon: 'DataAnalysis' },
  { path: '/products', title: '商品管理', icon: 'Goods' },
  { path: '/auction', title: '竞拍管理', icon: 'Timer' },
  { path: '/orders', title: '订单管理', icon: 'Document' },
  { path: '/deposits', title: '保证金', icon: 'Wallet' },
  { path: '/earnings', title: '收益明细', icon: 'Money' },
  { path: '/withdraw', title: '提现', icon: 'CreditCard' }
]

const currentTitle = computed(() => {
  const item = menuList.find(m => route.path.startsWith(m.path))
  return item?.title || '竞拍商家后台'
})

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await logout()
    } catch (e) {}
    localStorage.removeItem('admin_token')
    router.push('/login')
  }
}
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  color: #333;
}
</style>
