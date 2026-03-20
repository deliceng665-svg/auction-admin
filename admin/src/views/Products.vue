<template>
  <div class="products-page">
    <!-- 操作栏 -->
    <div class="card" style="margin-bottom: 20px">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索商品名称"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.status" placeholder="状态筛选" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="竞拍中" value="active" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-col>
        <el-col :span="14">
          <el-button type="primary" @click="$router.push('/products/add')">
            <el-icon><Plus /></el-icon>
            发布商品
          </el-button>
          <el-button @click="handleSearch">搜索</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 商品列表 -->
    <div class="card">
      <el-table :data="productList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-img">{{ row.icon || '📦' }}</div>
              <div class="product-detail">
                <div class="product-title">{{ row.title }}</div>
                <div class="product-price">
                  起拍价 ¥{{ row.startPrice }} | 售价 ¥{{ row.fixedPrice }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="profitRatio" label="收益比例" width="80">
          <template #default="{ row }">
            {{ row.profitRatio }}%
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', `status-${row.status}`]">
              {{ statusMap[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="bidCount" label="出价次数" width="80" />
        <el-table-column prop="currentPrice" label="当前价" width="100">
          <template #default="{ row }">
            ¥{{ row.currentPrice || row.startPrice }}
          </template>
        </el-table-column>
        <el-table-column label="竞拍时间" width="180">
          <template #default="{ row }">
            <div class="time-info">
              <div>开始: {{ row.startTime || '-' }}</div>
              <div>结束: {{ row.endTime || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button
              v-if="row.status === 'active'"
              link
              type="danger"
              @click="handleEnd(row)"
            >
              结束
            </el-button>
            <el-button
              v-if="row.status === 'draft'"
              link
              type="danger"
              @click="handleDelete(row)"
            >
              删除
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
import { getProducts, deleteProduct } from '../api'

const router = useRouter()

const loading = ref(false)
const productList = ref([])

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const statusMap = {
  draft: '草稿',
  pending: '待审核',
  active: '竞拍中',
  ended: '已结束'
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const data = await getProducts(params)
    productList.value = data.list || []
    pagination.total = data.total || 0
  } catch (e) {
    // 演示数据
    productList.value = [
      { id: 1, title: 'iPhone 15 Pro Max 256GB', icon: '📱', startPrice: 5000, fixedPrice: 8000, profitRatio: 10, status: 'active', bidCount: 23, currentPrice: 6800, startTime: '2024-01-10 10:00', endTime: '2024-01-15 10:00' },
      { id: 2, title: 'MacBook Pro 14寸 M3', icon: '💻', startPrice: 10000, fixedPrice: 15000, profitRatio: 8, status: 'active', bidCount: 15, currentPrice: 12000, startTime: '2024-01-12 10:00', endTime: '2024-01-18 10:00' },
      { id: 3, title: 'AirPods Pro 2代', icon: '🎧', startPrice: 1000, fixedPrice: 2000, profitRatio: 12, status: 'draft', bidCount: 0, currentPrice: 1000, startTime: '-', endTime: '-' },
      { id: 4, title: 'iPad Pro 12.9寸', icon: '📱', startPrice: 4000, fixedPrice: 7000, profitRatio: 10, status: 'ended', bidCount: 8, currentPrice: 5500, startTime: '2024-01-01 10:00', endTime: '2024-01-05 10:00' },
      { id: 5, title: 'Apple Watch S9', icon: '⌚', startPrice: 1500, fixedPrice: 3000, profitRatio: 12, status: 'pending', bidCount: 0, currentPrice: 1500, startTime: '-', endTime: '-' }
    ]
    pagination.total = 5
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  if (row.status === 'pending') {
    ElMessage.warning('待审核状态不可编辑')
    return
  }
  router.push(`/products/edit/${row.id}`)
}

const handleView = (row) => {
  router.push(`/auction/${row.id}`)
}

const handleEnd = async (row) => {
  try {
    await ElMessageBox.confirm('确定要手动结束该竞拍吗？', '提示', {
      type: 'warning'
    })
    ElMessage.success('竞拍已结束')
    loadData()
  } catch (e) {}
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      type: 'warning'
    })
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    ElMessage.success('删除成功（演示）')
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

.product-price {
  font-size: 12px;
  color: #888;
}

.time-info {
  font-size: 12px;
  color: #666;
}

.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
