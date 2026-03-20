import express from 'express'
import { dbOps, getDb } from '../models/db.js'

const router = express.Router()

// 获取收益汇总
router.get('/summary', (req, res) => {
  const { merchant_id } = req.query

  // 累计收益
  const earnings = dbOps.getEarnings({ merchant_id: merchant_id ? parseInt(merchant_id) : null })
  const total = earnings.reduce((sum, e) => sum + (e.merchant_earnings || 0), 0)

  // 今日收益
  const today = new Date().toISOString().split('T')[0]
  const todayEarnings = earnings
    .filter(e => e.order_time && e.order_time.startsWith(today))
    .reduce((sum, e) => sum + (e.merchant_earnings || 0), 0)

  // 已提现
  const withdrawals = merchant_id ? dbOps.getWithdrawals(parseInt(merchant_id)) : []
  const withdrawn = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + (w.amount || 0), 0)

  // 可提现 = 累计收益 - 已提现
  const withdrawable = total - withdrawn

  res.json({
    code: 200,
    data: {
      totalEarnings: total,
      todayEarnings: todayEarnings,
      withdrawable,
      withdrawn
    }
  })
})

// 获取收益明细
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, merchant_id } = req.query
  
  const filter = {}
  if (merchant_id) filter.merchant_id = parseInt(merchant_id)

  let earnings = dbOps.getEarnings(filter)

  // 添加商品信息
  const listWithProducts = earnings.map(e => {
    const product = dbOps.getProductById(e.product_id)
    return {
      ...e,
      title: product?.title || '未知商品',
      icon: product?.icon || ''
    }
  })

  // 分页
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const paginatedList = listWithProducts.slice(offset, offset + parseInt(pageSize))

  res.json({ code: 200, data: { list: paginatedList, total: listWithProducts.length } })
})

export default router
