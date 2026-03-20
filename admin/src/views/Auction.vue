<template>
  <div class="auction-page">
    <!-- 操作栏 -->
    <div class="card" style="margin-bottom: 20px">
      <el-row :gutter="16" align="middle">
        <el-col :span="8">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="loadData">
            <el-option label="全部" value="" />
            <el-option label="竞拍中" value="active" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-col>
        <el-col :span="16">
          <el-button type="primary" @click="$router.push('/products/add')">
            <el-icon><Plus /></el-icon>
            发布新商品
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 竞拍列表 -->
    <div class="card">
      <el-table :data="auctionList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-img">{{ row.icon || '📦' }}</div>
              <div class="product-detail">
                <div class="product-title">{{ row.title }}</div>
                <div class="product-meta">
                  <span>起拍价 ¥{{ row.startPrice }}</span>
                  <span>加价幅度 ¥{{ row.bidIncrement }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" width="120">
          <template #default="{ row }">
            <div>
              <div class="current-price">¥{{ row.currentPrice }}</div>
              <el-tag v-if="row.status === 'active'" type="success" size="small">
                竞拍中
              </el-tag>
              <el-tag v-else type="info" size="small">已结束</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="bidCount" label="出价次数" width="80" />
        <el-table-column prop="userCount" label="参与人数" width="80" />
        <el-table-column label="剩余时间" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" :type="row.remaining < 3600000 ? 'danger' : 'warning'">
              {{ formatTime(row.remaining) }}
            </el-tag>
            <span v-else>已结束</span>
          </template>
        </el-table-column>
        <el-table-column label="收益" width="100">
          <template #default="{ row }">
            <span class="earnings">¥{{ row.earnings || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'active' && row.bidCount === 0"
              link
              type="danger"
              @click="handleEnd(row)"
            >
              结束
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAuctions, endAuction } from '../api'

const router = useRouter()

const loading = ref(false)
const auctionList = ref([])
const statusFilter = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formatTime = (ms) => {
  if (ms < 0) return '已结束'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (hours > 0) return `${hours}h${minutes}m`
  return `${minutes}分钟`
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: statusFilter.value || undefined
    }
    const data = await getAuctions(params)
    auctionList.value = data.list || []
    pagination.total = data.total || 0
  } catch (e) {
    // 演示数据
    auctionList.value = [
      { id: 1, title: 'iPhone 15 Pro Max 256GB', icon: '📱', startPrice: 5000, currentPrice: 6800, bidIncrement: 100, bidCount: 23, userCount: 15, status: 'active', remaining: 3600000 * 2, earnings: 180 },
      { id: 2, title: 'MacBook Pro 14寸 M3', icon: '💻', startPrice: 10000, currentPrice: 12000, bidIncrement: 200, bidCount: 15, userCount: 10, status: 'active', remaining: 3600000 * 5, earnings: 200 },
      { id: 3, title: 'AirPods Pro 2代', icon: '🎧', startPrice: 1000, currentPrice: 1500, bidIncrement: 50, bidCount: 8, userCount: 6, status: 'active', remaining: 3600000 * 1, earnings: 50 },
      { id: 4, title: 'iPad Pro 12.9寸', icon: '📱', startPrice: 4000, currentPrice: 5500, bidIncrement: 100, bidCount: 8, userCount: 5, status: 'ended', remaining: -1, earnings: 150 },
      { id: 5, title: 'Apple Watch S9', icon: '⌚', startPrice: 1500, currentPrice: 2200, bidIncrement: 50, bidCount: 12, userCount: 8, status: 'active', remaining: 3600000 * 3, earnings: 70 }
    ]
    pagination.total = 5
  } finally {
    loading.value = false
  }
}

const handleView = (row) => {
  router.push(`/auction/${row.id}`)
}

const handleEnd = async (row) => {
  try {
    await ElMessageBox.confirm('确定要结束该竞拍吗？', '提示', {
      type: 'warning'
    })
    await endAuction(row.id)
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
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-img {
  width: 60px;
  height: 60px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.product-detail {
  flex: 1;
}

.product-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.product-meta {
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 12px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #0D2B5B;
  margin-bottom: 4px;
}

.earnings {
  color: #4caf50;
  font-weight: 500;
}

.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
