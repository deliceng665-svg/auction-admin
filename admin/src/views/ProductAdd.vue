<template>
  <div class="product-add-page">
    <div class="card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="form-section-title">基本信息</div>

          <el-form-item label="商品名称" prop="title">
            <el-input v-model="form.title" placeholder="请输入商品名称" maxlength="50" show-word-limit />
          </el-form-item>

          <el-form-item label="商品图标" prop="icon">
            <div class="icon-selector">
              <div
                v-for="icon in iconList"
                :key="icon"
                class="icon-item"
                :class="{ active: form.icon === icon }"
                @click="form.icon = icon"
              >
                {{ icon }}
              </div>
            </div>
          </el-form-item>

          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入商品描述"
            />
          </el-form-item>
        </div>

        <!-- 价格设置 -->
        <div class="form-section">
          <div class="form-section-title">价格设置</div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="起拍价" prop="startPrice">
                <el-input-number v-model="form.startPrice" :min="0" :step="100" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="固定售价" prop="fixedPrice">
                <el-input-number v-model="form.fixedPrice" :min="0" :step="100" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="收益比例" prop="profitRatio">
                <el-input-number v-model="form.profitRatio" :min="0" :max="100" :precision="0" :step="1">
                  <template #append>%</template>
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="加价幅度" prop="bidIncrement">
                <el-input-number v-model="form.bidIncrement" :min="1" :step="10" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="保证金" prop="deposit">
                <el-input-number v-model="form.deposit" :min="0" :step="100" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="库存" prop="stock">
                <el-input-number v-model="form.stock" :min="1" :max="1" :disabled="true" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 竞拍时间 -->
        <div class="form-section">
          <div class="form-section-title">竞拍时间</div>

          <el-form-item label="开始时间" prop="startTime">
            <el-radio-group v-model="form.startType">
              <el-radio label="now">立即开始</el-radio>
              <el-radio label="schedule">定时开始</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="form.startType === 'schedule'" label="选择时间" prop="scheduleStartTime">
            <el-date-picker
              v-model="form.scheduleStartTime"
              type="datetime"
              placeholder="选择开始时间"
              :shortcuts="shortcuts"
            />
          </el-form-item>

          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="选择结束时间"
              :shortcuts="shortcuts"
            />
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit('publish')" :loading="loading">
            提交审核
          </el-button>
          <el-button @click="handleSubmit('draft')">保存草稿</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createProduct, updateProduct, getProduct } from '../api'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)
const isEdit = ref(false)

const iconList = ['📱', '💻', '📺', '🖥️', '📠', '🎧', '⌚', '📷', '🎮', '👟', '👜', '💍']

const shortcuts = [
  {
    text: '1小时后',
    value: () => dayjs().add(1, 'hour')
  },
  {
    text: '3小时后',
    value: () => dayjs().add(3, 'hour')
  },
  {
    text: '6小时后',
    value: () => dayjs().add(6, 'hour')
  },
  {
    text: '1天后',
    value: () => dayjs().add(1, 'day')
  },
  {
    text: '3天后',
    value: () => dayjs().add(3, 'day')
  }
]

const form = reactive({
  title: '',
  icon: '📱',
  description: '',
  startPrice: 0,
  fixedPrice: 0,
  profitRatio: 10,
  bidIncrement: 100,
  deposit: 500,
  stock: 1,
  startType: 'now',
  scheduleStartTime: '',
  endTime: ''
})

const rules = {
  title: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  startPrice: [
    { required: true, message: '请输入起拍价', trigger: 'blur' }
  ],
  fixedPrice: [
    { required: true, message: '请输入固定售价', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value <= form.startPrice) {
          callback(new Error('固定售价必须大于起拍价'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  profitRatio: [
    { required: true, message: '请输入收益比例', trigger: 'blur' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

const handleSubmit = async (type) => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (form.fixedPrice <= form.startPrice) {
    ElMessage.error('固定售价必须大于起拍价')
    return
  }

  loading.value = true

  const data = {
    ...form,
    status: type === 'publish' ? 'pending' : 'draft',
    startTime: form.startType === 'now' ? dayjs().format('YYYY-MM-DD HH:mm:ss') : dayjs(form.scheduleStartTime).format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs(form.endTime).format('YYYY-MM-DD HH:mm:ss')
  }

  try {
    if (isEdit.value) {
      await updateProduct(route.params.id, data)
      ElMessage.success('更新成功')
    } else {
      await createProduct(data)
      ElMessage.success(type === 'publish' ? '提交审核成功' : '保存草稿成功')
    }
    router.push('/products')
  } catch (e) {
    ElMessage.success(type === 'publish' ? '提交审核成功（演示）' : '保存草稿成功（演示）')
    router.push('/products')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true
    try {
      const data = await getProduct(route.params.id)
      Object.assign(form, data)
    } catch (e) {
      // 演示数据
    }
  }
})
</script>

<style scoped>
.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid #e5eaf1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  border-color: #0D2B5B;
}

.icon-item.active {
  border-color: #0D2B5B;
  background: #EDF6FF;
}
</style>
