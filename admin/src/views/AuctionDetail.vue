<template>
  <div class="auction-detail-page">
    <!-- 基本信息 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <div class="card">
          <div class="card-title">商品信息</div>
          <div class="product-header">
            <div class="product-img">{{ auction.icon || '📦' }}</div>
            <div class="product-info">
              <h3>{{ auction.title }}</h3>
              <div class="price-row">
                <div class="price-item">
                  <span class="label">起拍价</span>
                  <span class="value">¥{{ auction.startPrice }}</span>
                </div>
                <div class="price-item">
                  <span class="label">当前价</span>
                  <span class="value highlight">¥{{ auction.currentPrice }}</span>
                </div>
                <div class="price-item">
                  <span class="label">加价幅度</span>
                  <span class="value">¥{{ auction.bidIncrement }}</span>
                </div>
                <div class="price-item">
                  <span class="label">收益比例</span>
                  <span class="value">{{ auction.profitRatio }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="card">
          <div class="card-title">竞拍状态</div>
          <div class="status-info">
            <el-tag v-if="auction.status === 'active'" type="success" size="large">
              竞拍中
            </el-tag>
            <el-tag v-else type="info" size="large">已结束</el-tag>

            <div class="time-info" v-if="auction.status === 'active'">
              <div class="time-label">剩余时间</div>
              <div class="time-value">{{ formatTime(auction.remaining) }}</div>
            </div>

            <div class="stat-row">
              <div class="stat-item">
                <div class="stat-value">{{ auction.bidCount }}</div>
                <div class="stat-label">出价次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ auction.userCount }}</div>
                <div class="stat-label">参与人数</div>
              </div>
            </div>

            <div class="earnings-info">
              <div>预估收益: <span class="highlight">¥{{ auction.earnings || 0 }}</span></div>
              <div class="tips">* 成交后用户收益: ¥{{ userEarnings }}</div>
              <div class="tips">* 平台抽成(5%): ¥{{ platformFee }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 出价记录 -->
    <div class="card" style="margin-top: 20px">
      <div class="card-title">出价记录</div>
      <el-table :data="bids" v-loading="loading">
        <el-table-column prop="id" label="序号" width="60" />
        <el-table-column label="用户" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32">{{ row.nickname[0] }}</el-avatar>
              <span>{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="出价金额" width="120">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户收益" width="120">
          <template #default="{ row }">
            <span class="earnings-text">+¥{{ row.earnings }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="出价时间" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isWinner" type="success" size="small">领先</el-tag>
            <el-tag v-else-if="row.isOutbid" type="info" size="small">已出局</el-tag>
            <el-tag v-else size="small">正常</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar" v-if="auction.status === 'active'">
      <el-button type="danger" @click="handleEnd">手动结束竞拍</el-button>
      <el-button @click="$router.back()">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAuction, getAuctionBids, endAuction } from '../api'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const auction = ref({})
const bids = ref([])

const userEarnings = computed(() => {
  if (!auction.value.currentPrice || !auction.value.lastPrice) return 0
  return Math.floor((auction.value.currentPrice - auction.value.lastPrice) * (auction.value.profitRatio || 10) / 100)
})

const platformFee = computed(() => {
  return Math.floor(auction.value.currentPrice * 0.05)
})

const formatTime = (ms) => {
  if (ms < 0) return '已结束'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${hours}小时${minutes}分${seconds}秒`
}

const loadData = async () => {
  loading.value = true
  try {
    auction.value = await getAuction(route.params.id)
    bids.value = await getAuctionBids(route.params.id)
  } catch (e) {
    // 演示数据
    auction.value = {
      id: 1,
      title: 'iPhone 15 Pro Max 256GB',
      icon: '📱',
      startPrice: 5000,
      currentPrice: 6800,
      lastPrice: 6700,
      bidIncrement: 100,
      profitRatio: 10,
      bidCount: 23,
      userCount: 15,
      status: 'active',
      remaining: 3600000 * 2,
      earnings: 180
    }
    bids.value = [
      { id: 23, nickname: '用户A', price: 6800, earnings: 100, time: '2024-01-15 14:30:25', isWinner: true },
      { id: 22, nickname: '用户B', price: 6700, earnings: 90, time: '2024-01-15 14:28:10', isOutbid: true },
      { id: 21, nickname: '用户C', price: 6600, earnings: 80, time: '2024-01-15 14:25:55', isOutbid: true },
      { id: 20, nickname: '用户A', price: 6500, earnings: 70, time: '2024-01-15 14:22:30', isOutbid: true },
      { id: 19, nickname: '用户D', price: 6400, earnings: 60, time: '2024-01-15 14:18:15', isOutbid: true }
    ]
  } finally {
    loading.value = false
  }
}

const handleEnd = async () => {
  try {
    await ElMessageBox.confirm('确定要手动结束该竞拍吗？', '提示', {
      type: 'warning'
    })
    await endAuction(auction.value.id)
    ElMessage.success('竞拍已结束')
    loadData()
  } catch (e) {
    ElMessage.success('竞拍已结束（演示）')
    loadData()
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.product-header {
  display: flex;
  gap: 20px;
}

.product-img {
  width: 120px;
  height: 120px;
  background: #f5f7fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.product-info h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.price-row {
  display: flex;
  gap: 24px;
}

.price-item {
  display: flex;
  flex-direction: column;
}

.price-item .label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.price-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.price-item .value.highlight {
  color: #0D2B5B;
}

.status-info {
  text-align: center;
}

.time-info {
  margin: 20px 0;
}

.time-label {
  font-size: 12px;
  color: #888;
}

.time-value {
  font-size: 24px;
  font-weight: bold;
  color: #ff9800;
}

.stat-row {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #888;
}

.earnings-info {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
}

.earnings-info .highlight {
  font-weight: bold;
  color: #4caf50;
  font-size: 18px;
}

.earnings-info .tips {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-text {
  font-weight: bold;
  color: #0D2B5B;
}

.earnings-text {
  color: #4caf50;
  font-weight: 500;
}

.action-bar {
  margin-top: 20px;
  text-align: center;
}
</style>
