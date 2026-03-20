import express from 'express'
import jwt from 'jsonwebtoken'
import { dbOps } from '../models/db.js'

const router = express.Router()
const JWT_SECRET = 'auction-merchant-secret-key'

// 获取商家ID
function getMerchantId(token) {
  if (token) {
    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET)
      return decoded.id
    } catch (e) {}
  }
  return 1
}

// 获取提现记录
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  const merchantId = getMerchantId(req.headers.authorization)

  let withdrawals = dbOps.getWithdrawals(merchantId)

  // 分页
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const paginatedList = withdrawals.slice(offset, offset + parseInt(pageSize))

  res.json({ code: 200, data: { list: paginatedList, total: withdrawals.length } })
})

// 申请提现
router.post('/', (req, res) => {
  const { amount, method, account } = req.body
  const merchantId = getMerchantId(req.headers.authorization)

  if (!amount || amount < 100) {
    return res.json({ code: 400, message: '最低提现金额100元' })
  }

  // 检查可提现余额
  const earnings = dbOps.getEarnings({ merchant_id: merchantId })
  const totalEarnings = earnings.reduce((sum, e) => sum + (e.merchant_earnings || 0), 0)

  const withdrawals = dbOps.getWithdrawals(merchantId)
  const withdrawn = withdrawals
    .filter(w => w.status !== 'failed')
    .reduce((sum, w) => sum + (w.amount || 0), 0)

  const withdrawable = totalEarnings - withdrawn

  if (amount > withdrawable) {
    return res.json({ code: 400, message: '余额不足' })
  }

  // 创建提现记录
  const withdrawal = dbOps.createWithdrawal({
    merchant_id: merchantId,
    amount,
    method,
    account,
    status: 'pending'
  })

  res.json({ code: 200, data: { id: withdrawal.id } })
})

export default router
