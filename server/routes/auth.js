import express from 'express'
import jwt from 'jsonwebtoken'
import { dbOps } from '../models/db.js'

const router = express.Router()
const JWT_SECRET = 'auction-merchant-secret-key'

// 登录
router.post('/login', (req, res) => {
  const { phone, code } = req.body

  // 演示模式：接受任意6位验证码
  if (code === '123456' || code.length === 6) {
    let merchant = dbOps.findMerchant(phone)

    if (!merchant) {
      // 自动创建商家
      merchant = dbOps.createMerchant({ phone, password: 'demo', name: '新商家' })
    }

    const token = jwt.sign(
      { id: merchant.id, phone: merchant.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.json({
      code: 200,
      data: { token, user: { id: merchant.id, phone: merchant.phone, name: merchant.name } }
    })
  }

  res.json({ code: 400, message: '验证码错误' })
})

// 登出
router.post('/logout', (req, res) => {
  res.json({ code: 200, data: null })
})

// 获取用户信息
router.get('/user', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.json({ code: 401, message: '未登录' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const merchant = dbOps.findMerchantById(decoded.id)

    if (!merchant) {
      return res.json({ code: 401, message: '用户不存在' })
    }

    res.json({ code: 200, data: { id: merchant.id, phone: merchant.phone, name: merchant.name } })
  } catch (e) {
    res.json({ code: 401, message: 'token无效' })
  }
})

export default router
