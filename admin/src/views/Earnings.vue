<template>
  <div class="earnings-page">
    <!-- 收益统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #e3f2fd; color: #2196f3">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-value">¥{{ formatMoney(summary.totalEarnings) }}</div>
        <div class="stat-label">累计收益</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #e8f5e9; color: #4caf50">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-value">¥{{ formatMoney(summary.todayEarnings) }}</div>
        <div class="stat-label">今日收益</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fff3e0; color: #ff9800">
          <el-icon><Wallet /></el-icon>
        </div>
        <div class="stat-value">¥{{ formatMoney(summary.withdrawable) }}</div>
        <div class="stat-label">可提现</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fce4ec; color: #e91e63">
          <el-icon><CreditCard /></el-icon>
        </div>
        <div class="stat-value">¥{{ formatMoney(summary.withdrawn) }}</div>
        <div class="stat-label">已提现</div>
      </div>
    </div>

    <!-- 收益明细 -->
    <div class="card">
      <div class="card-title">收益明细</div>
      <el-table :data="earningsList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="商品" min-width="180">
          <template #default="{ row }">
            <div class="product-info">
              <span class="product-icon">{{ row.icon }}</span>
              {{ row.title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成交价" width="100">
          <template #default="{ row }">
            ¥{{ row.finalPrice }}
          </template>
        </el-table-column>
        <el-table-column label="用户收益" width="100">
          <template #default="{ row }">
            <span class="user-earnings">-¥{{ row.userEarnings }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平台抽成" width="100">
          <template #default="{ row }">
            <span class="platform-fee">-¥{{ row.platformFee }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商家收益" width="100">
          <template #default="{ row }">
            <span class="merchant-earnings">+¥{{ row.merchantEarnings }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'settled' ? 'success' : 'warning'" size="small">
              {{ row.status === 'settled' ? '已结算' : '待结算' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="成交时间" width="160" />
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getEarnings, getEarningsSummary } from '../api'

const loading = ref(false)
const earningsList = ref([])

const summary = reactive({
  totalEarnings: 0,
  todayEarnings: 0,
  withdrawable: 0,
  withdrawn: 0
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    const [summaryData, listData] = await Promise.all([
      getEarningsSummary(),
      getEarnings(pagination)
    ])
    Object.assign(summary, summaryData)
    earningsList.value = listData.list || []
    pagination.total = listData.total || 0
  } catch (e) {
    // 演示数据
    summary.totalEarnings = 268500
    summary.todayEarnings = 5680
    summary.withdrawable = 45680
    summary.withdrawn = 220000

    earningsList.value = [
      { id: 1, icon: '📱', title: 'iPhone 15 Pro Max', finalPrice: 6800, userEarnings: 680, platformFee: 340, merchantEarnings: 5780, status: 'settled', orderTime: '2024-01-15 15:30:00' },
      { id: 2, icon: '💻', title: 'MacBook Pro 14寸', finalPrice: 12000, userEarnings: 1200, platformFee: 600, merchantEarnings: 10200, status: 'settled', orderTime: '2024-01-14 18:20:00' },
      { id: 3, icon: '🎧', title: 'AirPods Pro 2代', finalPrice: 1500, userEarnings: 150, platformFee: 75, merchantEarnings: 1275, status: 'settled', orderTime: '2024-01-13 14:10:00' },
      { id: 4, icon: '📱', title: 'iPad Pro 12.9寸', finalPrice: 5500, userEarnings: 550, platformFee: 275, merchantEarnings: 4675, status: 'pending', orderTime: '2024-01-15 16:45:00' }
    ]
    pagination.total = 4
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.product-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-icon {
  font-size: 20px;
}

.user-earnings {
  color: #ff9800;
}

.platform-fee {
  color: #f44336;
}

.merchant-earnings {
  color: #4caf50;
  font-weight: bold;
}

.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
