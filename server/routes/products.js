import express from 'express'
import { dbOps } from '../models/db.js'

const router = express.Router()

// 获取商品列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, keyword, status, merchant_id } = req.query
  
  const filter = {}
  if (keyword) filter.keyword = keyword
  if (status) filter.status = status
  if (merchant_id) filter.merchant_id = parseInt(merchant_id)

  let products = dbOps.getProducts(filter)
  
  // 计算出价次数和当前价
  const listWithBids = products.map(p => {
    const bids = dbOps.getBids(p.id)
    return {
      ...p,
      bidCount: bids.length,
      currentPrice: bids.length > 0 ? bids[0].price : p.start_price
    }
  })

  // 分页
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const paginatedList = listWithBids.slice(offset, offset + parseInt(pageSize))

  res.json({ code: 200, data: { list: paginatedList, total: listWithBids.length } })
})

// 获取单个商品
router.get('/:id', (req, res) => {
  const product = dbOps.getProductById(req.params.id)

  if (!product) {
    return res.json({ code: 404, message: '商品不存在' })
  }

  res.json({ code: 200, data: product })
})

// 创建商品
router.post('/', (req, res) => {
  const {
    title, icon, description, start_price, fixed_price, profit_ratio,
    bid_increment, deposit, stock, status, start_time, end_time, merchant_id
  } = req.body

  const product = dbOps.createProduct({
    merchant_id: merchant_id || 1,
    title, icon, description, start_price, fixed_price, profit_ratio,
    bid_increment, deposit, stock: stock || 1, status: status || 'draft',
    start_time, end_time
  })

  res.json({ code: 200, data: { id: product.id } })
})

// 更新商品
router.put('/:id', (req, res) => {
  const {
    title, icon, description, start_price, fixed_price, profit_ratio,
    bid_increment, deposit, stock, start_time, end_time
  } = req.body

  const product = dbOps.updateProduct(req.params.id, {
    title, icon, description, start_price, fixed_price, profit_ratio,
    bid_increment, deposit, stock, start_time, end_time
  })

  res.json({ code: 200, data: product })
})

// 删除商品
router.delete('/:id', (req, res) => {
  dbOps.deleteProduct(req.params.id)
  res.json({ code: 200, data: null })
})

// 发布商品
router.post('/:id/publish', (req, res) => {
  dbOps.updateProduct(req.params.id, { status: 'pending' })
  res.json({ code: 200, data: null })
})

export default router
