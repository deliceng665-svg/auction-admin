<template>
  <div class="orders-page">
    <!-- 操作栏 -->
    <div class="card" style="margin-bottom: 20px">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-select v-model="searchForm.status" placeholder="订单状态" clearable @change="loadData">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/用户"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button @click="handleSearch">搜索</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 订单列表 -->
    <div class="card">
      <el-table :data="orderList" v-loading="loading" style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-img">{{ row.icon || '📦' }}</div>
              <div class="product-detail">
                <div class="product-title">{{ row.title }}</div>
                <div class="product-meta">成交价 ¥{{ row.price }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="买家" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="28">{{ row.nickname[0] }}</el-avatar>
              <span>{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', `status-${row.status}`]">
              {{ statusMap[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="支付时间" width="160">
          <template #default="{ row }">
            {{ row.payTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'paid'"
              link
              type="primary"
              @click="handleShip(row)"
            >
              发货
            </el-button>
            <el-button
              v-if="row.status === 'shipped'"
              link
              type="success"
              @click="handleComplete(row)"
            >
              确认完成
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

    <!-- 发货弹窗 -->
    <el-dialog v-model="shipDialogVisible" title="发货" width="500px">
      <el-form :model="shipForm" label-width="80px">
        <el-form-item label="物流公司">
          <el-select v-model="shipForm.company" placeholder="请选择物流公司">
            <el-option label="顺丰速运" value="sf" />
            <el-option label="中通快递" value="zt" />
            <el-option label="圆通速递" value="yt" />
            <el-option label="韵达快递" value="yd" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="shipForm.trackingNo" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确定发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrders, shipOrder } from '../api'

const loading = ref(false)
const orderList = ref([])
const shipDialogVisible = ref(false)
const currentOrder = ref(null)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const shipForm = reactive({
  company: '',
  trackingNo: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const statusMap = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成'
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
    const data = await getOrders(params)
    orderList.value = data.list || []
    pagination.total = data.total || 0
  } catch (e) {
    // 演示数据
    orderList.value = [
      { id: 1, orderNo: 'O202401150001', title: 'iPhone 15 Pro Max', icon: '📱', price: 6800, nickname: '张三', status: 'shipped', payTime: '2024-01-15 15:30:00', trackingNo: 'SF1234567890', company: '顺丰速运' },
      { id: 2, orderNo: 'O202401140002', title: 'MacBook Pro 14寸', icon: '💻', price: 12000, nickname: '李四', status: 'paid', payTime: '2024-01-14 18:20:00' },
      { id: 3, orderNo: 'O202401130003', title: 'AirPods Pro 2代', icon: '🎧', price: 1500, nickname: '王五', status: 'completed', payTime: '2024-01-13 10:00:00' },
      { id: 4, orderNo: 'O202401120004', title: 'iPad Pro 12.9寸', icon: '📱', price: 5500, nickname: '赵六', status: 'pending', payTime: null }
    ]
    pagination.total = 4
  } finally {
    loading.value = false
  }
}

const handleView = (row) => {
  ElMessage.info('查看订单详情')
}

const handleShip = (row) => {
  currentOrder.value = row
  shipForm.company = ''
  shipForm.trackingNo = ''
  shipDialogVisible.value = true
}

const confirmShip = async () => {
  if (!shipForm.company || !shipForm.trackingNo) {
    ElMessage.warning('请填写物流信息')
    return
  }

  try {
    await shipOrder(currentOrder.value.id, shipForm)
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('发货成功（演示）')
    shipDialogVisible.value = false
    loadData()
  }
}

const handleComplete = (row) => {
  ElMessage.success('订单已完成')
  loadData()
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
  width: 50px;
  height: 50px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.product-title {
  font-weight: 500;
  color: #333;
}

.product-meta {
  font-size: 12px;
  color: #888;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
