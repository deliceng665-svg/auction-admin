<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h2>欢迎回来，{{ userName }}</h2>
        <p>今天是 {{ today }}，继续加油！</p>
        <div class="welcome-stats">
          <div class="stat-pill">
            <span class="stat-dot"></span>
            实时数据
          </div>
        </div>
      </div>
      <div class="welcome-illustration">
        <div class="avatar-3d">
          <div class="avatar-body"></div>
          <div class="avatar-face">
            <div class="eye left"></div>
            <div class="eye right"></div>
            <div class="mouth"></div>
          </div>
          <div class="avatar-bling b1"></div>
          <div class="avatar-bling b2"></div>
          <div class="avatar-bling b3"></div>
        </div>
      </div>
    </div>

    <!-- 数据统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon><Goods /></el-icon>
        </div>
        <div class="stat-value">{{ stats.totalProducts }}</div>
        <div class="stat-label">商品总数</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><Timer /></el-icon>
        </div>
        <div class="stat-value">{{ stats.activeAuctions }}</div>
        <div class="stat-label">进行中竞拍</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-value">{{ stats.totalOrders }}</div>
        <div class="stat-label">成交订单</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-value">¥{{ formatMoney(stats.totalEarnings) }}</div>
        <div class="stat-label">累计收益</div>
      </div>
    </div>

    <!-- 今日数据 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">今日数据</span>
        <el-tag type="success" effect="plain">实时更新</el-tag>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="today-item">
            <div class="today-icon blue">
              <el-icon><Pointer /></el-icon>
            </div>
            <div class="today-content">
              <div class="today-value">{{ stats.todayBids }}</div>
              <div class="today-label">今日出价</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="today-item">
            <div class="today-icon purple">
              <el-icon><View /></el-icon>
            </div>
            <div class="today-content">
              <div class="today-value">{{ stats.todayViews }}</div>
              <div class="today-label">今日浏览</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="today-item">
            <div class="today-icon green">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="today-content">
              <div class="today-value">{{ stats.todayOrders }}</div>
              <div class="today-label">今日成交</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="today-item">
            <div class="today-icon orange">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="today-content">
              <div class="today-value">¥{{ formatMoney(stats.todayEarnings) }}</div>
              <div class="today-label">今日收益</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷操作 & 最近竞拍 -->
    <el-row :gutter="24" style="margin-top: 24px">
      <el-col :span="10">
        <div class="card">
          <div class="card-header">
            <span class="card-title">快捷操作</span>
          </div>
          <div class="quick-actions">
            <div class="action-item" @click="$router.push('/products/add')">
              <div class="action-icon blue">
                <el-icon><Plus /></el-icon>
              </div>
              <span>发布商品</span>
            </div>
            <div class="action-item" @click="$router.push('/auction')">
              <div class="action-icon orange">
                <el-icon><Timer /></el-icon>
              </div>
              <span>查看竞拍</span>
            </div>
            <div class="action-item" @click="$router.push('/orders')">
              <div class="action-icon green">
                <el-icon><Document /></el-icon>
              </div>
              <span>订单管理</span>
            </div>
            <div class="action-item" @click="$router.push('/withdraw')">
              <div class="action-icon purple">
                <el-icon><CreditCard /></el-icon>
              </div>
              <span>申请提现</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="14">
        <div class="card">
          <div class="card-header">
            <span class="card-title">正在进行中的竞拍</span>
            <el-button text type="primary" @click="$router.push('/auction')">查看全部</el-button>
          </div>
          <el-table :data="recentAuctions" style="width: 100%">
            <el-table-column prop="title" label="商品" show-overflow-tooltip />
            <el-table-column prop="currentPrice" label="当前价" width="120">
              <template #default="{ row }">
                <span class="price">¥{{ formatMoney(row.currentPrice) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="bidCount" label="出价次数" width="90" align="center" />
            <el-table-column prop="endTime" label="剩余时间" width="110">
              <template #default="{ row }">
                <el-tag :type="row.remaining < 3600000 ? 'danger' : 'warning'" size="small" effect="light">
                  {{ formatTime(row.remaining) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty v-if="!recentAuctions.length" description="暂无进行中的竞拍" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getEarningsSummary, getAuctions } from '../api'
import dayjs from 'dayjs'

const userName = ref('商家')
const today = ref(dayjs().format('YYYY年MM月DD日'))

const stats = ref({
  totalProducts: 0,
  activeAuctions: 0,
  totalOrders: 0,
  totalEarnings: 0,
  todayBids: 0,
  todayViews: 0,
  todayOrders: 0,
  todayEarnings: 0
})

const recentAuctions = ref([])

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const formatTime = (ms) => {
  if (ms < 0) return '已结束'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (hours > 0) return `${hours}h${minutes}m`
  return `${minutes}m`
}

onMounted(async () => {
  // 模拟数据（后续对接真实 API）
  stats.value = {
    totalProducts: 28,
    activeAuctions: 5,
    totalOrders: 156,
    totalEarnings: 268500,
    todayBids: 89,
    todayViews: 1256,
    todayOrders: 8,
    todayEarnings: 5680
  }

  recentAuctions.value = [
    { id: 1, title: 'iPhone 15 Pro Max', currentPrice: 6800, bidCount: 23, remaining: 3600000 * 2 },
    { id: 2, title: 'MacBook Pro 14寸', currentPrice: 12000, bidCount: 15, remaining: 3600000 * 5 },
    { id: 3, title: 'AirPods Pro 2代', currentPrice: 1500, bidCount: 8, remaining: 3600000 * 1 }
  ]
})
</script>

<style scoped>
/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
  border-radius: 12px;
  padding: 32px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(22, 93, 255, 0.25);
}

.welcome-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.welcome-content p {
  font-size: 14px;
  opacity: 0.9;
}

.welcome-stats {
  margin-top: 16px;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 13px;
}

.stat-dot {
  width: 8px;
  height: 8px;
  background: #00FF88;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.welcome-illustration {
  position: relative;
  width: 120px;
  height: 120px;
}

.welcome-illustration span {
  font-size: 64px;
  opacity: 0.8;
}

/* 3D IP 形象 */
.welcome-illustration .avatar-3d {
  position: relative;
  width: 100px;
  height: 100px;
  animation: float 3s ease-in-out infinite;
}

.avatar-body {
  position: absolute;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fff 0%, #e8f4ff 50%, #cce4ff 100%);
  border-radius: 20px;
  top: 10px;
  left: 10px;
  box-shadow:
    0 10px 30px rgba(22, 93, 255, 0.3),
    inset 0 -5px 15px rgba(22, 93, 255, 0.1),
    inset 0 5px 15px rgba(255, 255, 255, 0.8);
  transform: perspective(500px) rotateX(10deg);
}

.avatar-face {
  position: absolute;
  width: 60px;
  height: 50px;
  top: 20px;
  left: 20px;
}

.eye {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #165DFF;
  border-radius: 50%;
  top: 10px;
  animation: blink 4s ease-in-out infinite;
}

.eye::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  top: 3px;
  right: 3px;
}

.eye.left { left: 5px; }
.eye.right { right: 5px; }

.mouth {
  position: absolute;
  width: 20px;
  height: 10px;
  background: #FF6B6B;
  border-radius: 0 0 20px 20px;
  bottom: 5px;
  left: 20px;
}

.avatar-bling {
  position: absolute;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;
}

.avatar-bling.b1 {
  width: 8px;
  height: 8px;
  top: 5px;
  right: 15px;
  animation-delay: 0s;
}

.avatar-bling.b2 {
  width: 5px;
  height: 5px;
  top: 25px;
  right: 5px;
  animation-delay: 0.5s;
}

.avatar-bling.b3 {
  width: 6px;
  height: 6px;
  bottom: 10px;
  left: 5px;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) perspective(500px) rotateX(10deg); }
  50% { transform: translateY(-10px) perspective(500px) rotateX(15deg); }
}

@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.5); }
}

/* 今日数据卡片 */
.today-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #F7F8FA;
  border-radius: 10px;
  transition: all 0.2s;
}

.today-item:hover {
  background: #F2F3F5;
}

.today-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.today-icon.blue { background: rgba(22, 93, 255, 0.1); color: #165DFF; }
.today-icon.purple { background: rgba(122, 55, 239, 0.1); color: #7A37FF; }
.today-icon.green { background: rgba(0, 170, 68, 0.1); color: #00AA44; }
.today-icon.orange { background: rgba(255, 170, 0, 0.1); color: #FFAA00; }

.today-content {
  flex: 1;
}

.today-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.today-label {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

/* 快捷操作 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #F7F8FA;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  background: #F2F3F5;
  transform: translateY(-2px);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.action-icon.blue { background: rgba(22, 93, 255, 0.1); color: #165DFF; }
.action-icon.orange { background: rgba(255, 170, 0, 0.1); color: #FFAA00; }
.action-icon.green { background: rgba(0, 170, 68, 0.1); color: #00AA44; }
.action-icon.purple { background: rgba(122, 55, 239, 0.1); color: #7A37FF; }

.action-item span {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 价格 */
.price {
  font-weight: 600;
  color: var(--danger-color);
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .welcome-banner {
    text-align: center;
    flex-direction: column;
    gap: 20px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
