<template>
  <div class="deposits-page">
    <!-- 统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #e3f2fd; color: #2196f3">
          <el-icon><Wallet /></el-icon>
        </div>
        <div class="stat-value">¥{{ formatMoney(stats.total) }}</div>
        <div class="stat-label">保证金总额</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #e8f5e9; color: #4caf50">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-value">¥{{ formatMoney(stats.refunded) }}</div>
        <div class="stat-label">已退还</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #ffebee; color: #f44336">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-value">¥{{ formatMoney(stats.deducted) }}</div>
        <div class="stat-label">已扣除</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fff3e0; color: #ff9800">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-value">¥{{ formatMoney(stats.holding) }}</div>
        <div class="stat-label">待退还</div>
      </div>
    </div>

    <!-- 保证金记录 -->
    <div class="card">
      <div class="card-title">保证金记录</div>
      <el-table :data="depositList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="28">{{ row.nickname[0] }}</el-avatar>
              <span>{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品" min-width="180">
          <template #default="{ row }">
            {{ row.title }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="保证金" width="100">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', `status-deposit-${row.status}`]">
              {{ statusMap[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="缴纳时间" width="160" />
        <el-table-column prop="handleTime" label="处理时间" width="160">
          <template #default="{ row }">
            {{ row.handleTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="150">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
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
import { getDeposits } from '../api'

const loading = ref(false)
const depositList = ref([])

const stats = reactive({
  total: 0,
  refunded: 0,
  deducted: 0,
  holding: 0
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const statusMap = {
  paid: '已缴纳',
  refunded: '已退还',
  deducted: '已扣除'
}

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const data = await getDeposits(params)
    depositList.value = data.list || []
    pagination.total = data.total || 0
  } catch (e) {
    // 演示数据
    stats.total = 15000
    stats.refunded = 8000
    stats.deducted = 2000
    stats.holding = 5000

    depositList.value = [
      { id: 1, nickname: '张三', title: 'iPhone 15 Pro Max', amount: 500, status: 'paid', payTime: '2024-01-15 14:30:00', handleTime: '-' },
      { id: 2, nickname: '李四', title: 'MacBook Pro 14寸', amount: 1000, status: 'refunded', payTime: '2024-01-14 10:20:00', handleTime: '2024-01-15 16:00:00' },
      { id: 3, nickname: '王五', title: 'AirPods Pro 2代', amount: 200, status: 'deducted', payTime: '2024-01-13 09:15:00', handleTime: '2024-01-14 11:30:00', remark: '中标未支付' },
      { id: 4, nickname: '赵六', title: 'iPad Pro 12.9寸', amount: 500, status: 'paid', payTime: '2024-01-12 18:45:00', handleTime: '-' }
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
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-deposit-paid { background: #fff3e0; color: #ff9800; }
.status-deposit-refunded { background: #e8f5e9; color: #4caf50; }
.status-deposit-deducted { background: #ffebee; color: #f44336; }

.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
