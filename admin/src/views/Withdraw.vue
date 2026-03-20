<template>
  <div class="withdraw-page">
    <!-- 可提现余额卡片 -->
    <el-row :gutter="24" style="margin-bottom: 24px">
      <el-col :span="24">
        <div class="balance-card">
          <div class="balance-main">
            <div class="balance-icon">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="balance-info">
              <div class="balance-label">可提现金额</div>
              <div class="balance-value">
                <span class="currency">¥</span>
                <span class="money">{{ formatMoney(balance.withdrawable) }}</span>
              </div>
            </div>
          </div>
          
          <div class="balance-stats">
            <div class="stat-item">
              <div class="stat-value">¥{{ formatMoney(balance.total) }}</div>
              <div class="stat-label">累计收益</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">¥{{ formatMoney(balance.withdrawn) }}</div>
              <div class="stat-label">已提现</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 提现表单 -->
    <el-row :gutter="24" style="margin-bottom: 24px">
      <el-col :span="16">
        <div class="card withdraw-form-card">
          <div class="card-header">
            <span class="card-title">申请提现</span>
          </div>
          
          <el-form label-position="top">
            <el-form-item label="提现金额">
              <div class="amount-input-wrapper">
                <span class="prefix">¥</span>
                <el-input-number
                  v-model="withdrawForm.amount"
                  :min="100"
                  :max="balance.withdrawable"
                  :step="100"
                  :precision="2"
                  size="large"
                />
              </div>
              <div class="quick-btns">
                <el-button 
                  v-for="amount in [1000, 5000, 10000]" 
                  :key="amount"
                  size="small" 
                  @click="withdrawForm.amount = amount"
                  :class="{ active: withdrawForm.amount === amount }"
                >
                  {{ amount }}
                </el-button>
                <el-button 
                  size="small" 
                  @click="withdrawForm.amount = balance.withdrawable"
                  :class="{ active: withdrawForm.amount === balance.withdrawable }"
                >
                  全部
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item label="提现方式">
              <el-radio-group v-model="withdrawForm.method">
                <el-radio value="wechat">
                  <el-icon><ChatDotRound /></el-icon>
                  微信
                </el-radio>
                <el-radio value="bank">
                  <el-icon><CreditCard /></el-icon>
                  银行卡
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      
      <el-col :span="8">
        <div class="card withdraw-action-card">
          <div class="action-info">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
            <p>提现申请提交后，预计 1-3 个工作日内到账</p>
          </div>
          
          <el-button 
            type="primary" 
            size="large" 
            @click="handleWithdraw" 
            :disabled="balance.withdrawable < 100 || !withdrawForm.amount"
            class="withdraw-btn"
          >
            <el-icon><Money /></el-icon>
            立即提现
          </el-button>
          
          <div class="min-tip">最低提现金额 ¥100</div>
        </div>
      </el-col>
    </el-row>

    <!-- 提现记录 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">提现记录</span>
      </div>
      
      <el-table :data="withdrawList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="amount" label="提现金额" width="140">
          <template #default="{ row }">
            <span class="amount">¥{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="提现方式" width="120">
          <template #default="{ row }">
            <div class="method-cell">
              <el-icon v-if="row.method === 'wechat'"><ChatDotRound /></el-icon>
              <el-icon v-else><CreditCard /></el-icon>
              {{ row.method === 'bank' ? '银行卡' : '微信' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="提现账号" min-width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]" size="small" effect="light">
              {{ statusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="170" />
        <el-table-column prop="completeTime" label="到账时间" width="170">
          <template #default="{ row }">
            {{ row.completeTime || '-' }}
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Wallet, ChatDotRound, CreditCard, InfoFilled, Money } from '@element-plus/icons-vue'
import { getWithdrawList, applyWithdraw } from '../api'

const loading = ref(false)
const withdrawList = ref([])

const balance = reactive({
  total: 268500,
  withdrawable: 45680,
  withdrawn: 220000
})

const withdrawForm = reactive({
  amount: 1000,
  method: 'wechat',
  account: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const statusMap = {
  pending: '处理中',
  completed: '已完成',
  failed: '失败'
}

const statusType = {
  pending: 'warning',
  completed: 'success',
  failed: 'danger'
}

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('zh-CN')
}

const handleWithdraw = async () => {
  if (withdrawForm.amount < 100) {
    ElMessage.warning('最低提现金额为100元')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要提现 ¥${withdrawForm.amount} 吗？`,
      '提现确认',
      { type: 'warning' }
    )

    await applyWithdraw({
      amount: withdrawForm.amount,
      method: withdrawForm.method
    })

    ElMessage.success('提现申请已提交')
    withdrawForm.amount = 0
    loadData()
  } catch (e) {
    ElMessage.success('提现申请已提交（演示）')
    withdrawForm.amount = 0
    loadData()
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const data = await getWithdrawList(params)
    withdrawList.value = data.list || []
    pagination.total = data.total || 0
  } catch (e) {
    // 演示数据
    withdrawList.value = [
      { id: 1, amount: 10000, method: 'bank', account: '6222 **** **** 8888', status: 'completed', createTime: '2024-01-10 10:00:00', completeTime: '2024-01-12 10:00:00' },
      { id: 2, amount: 5000, method: 'wechat', account: 'wx1234567890', status: 'completed', createTime: '2024-01-08 14:30:00', completeTime: '2024-01-10 14:30:00' },
      { id: 3, amount: 8000, method: 'bank', account: '6222 **** **** 6666', status: 'pending', createTime: '2024-01-15 09:00:00', completeTime: '-' }
    ]
    pagination.total = 3
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 余额卡片 */
.balance-card {
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
  border-radius: 12px;
  padding: 32px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 24px rgba(22, 93, 255, 0.25);
}

.balance-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.balance-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.balance-value {
  display: flex;
  align-items: baseline;
}

.balance-value .currency {
  font-size: 20px;
  font-weight: 500;
  margin-right: 4px;
}

.balance-value .money {
  font-size: 36px;
  font-weight: 700;
}

.balance-stats {
  display: flex;
  align-items: center;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-item .stat-value {
  font-size: 20px;
  font-weight: 600;
}

.stat-item .stat-label {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: rgba(255, 255, 255, 0.3);
}

/* 提现表单卡片 */
.withdraw-form-card .amount-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.withdraw-form-card .prefix {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-secondary);
}

.quick-btns {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.quick-btns .el-button.active {
  background: rgba(22, 93, 255, 0.1);
  border-color: #165DFF;
  color: #165DFF;
}

.method-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 操作卡片 */
.withdraw-action-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px;
}

.action-info {
  text-align: center;
  margin-bottom: 24px;
  color: var(--text-tertiary);
}

.action-info .info-icon {
  font-size: 32px;
  color: var(--warning-color);
  margin-bottom: 12px;
}

.action-info p {
  font-size: 13px;
  line-height: 1.6;
}

.withdraw-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.min-tip {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 金额样式 */
.amount {
  font-weight: 600;
  color: var(--text-primary);
}

/* 分页 */
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .balance-card {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .balance-main {
    flex-direction: column;
  }
  
  .balance-stats {
    width: 100%;
    justify-content: center;
  }
}
</style>
