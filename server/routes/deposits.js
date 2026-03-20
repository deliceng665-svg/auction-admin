import express from 'express'
import { dbOps } from '../models/db.js'

const router = express.Router()

// 获取保证金记录
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  
  // 从 db 对象获取 deposits
  const db = dbOps.getProducts ? dbOps : { deposits: [] }
  // 暂时简化处理
  const list = []
  const total = 0

  // 统计
  const stats = {
    total: 0,
    refunded: 0,
    deducted: 0,
    holding: 0
  }

  // 分页
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const paginatedList = list.slice(offset, offset + parseInt(pageSize))

  res.json({ code: 200, data: { list: paginatedList, total, stats } })
})

export default router
