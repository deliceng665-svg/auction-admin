import express from 'express'
import { dbOps } from '../models/db.js'

const router = express.Router()

// 生成订单号
function generateOrderNo() {
  return 'O' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
}

// 获取订单列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, keyword, status, merchant_id } = req.query
  
  const filter = {}
  if (status) filter.status = status
  if (merchant_id) filter.merchant_id = parseInt(merchant_id)

  let orders = dbOps.getOrders(filter)

  // 添加商品信息
  const listWithProducts = orders.map(order => {
    const product = dbOps.getProductById(order.product_id)
    return {
      ...order,
      title: product?.title || '未知商品',
      icon: product?.icon || ''
    }
  })

  // 关键字过滤
  let filteredList = listWithProducts
  if (keyword) {
    filteredList = listWithProducts.filter(o => 
      o.title.includes(keyword) || (o.user_nickname && o.user_nickname.includes(keyword))
    )
  }

  // 分页
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const paginatedList = filteredList.slice(offset, offset + parseInt(pageSize))

  res.json({ code: 200, data: { list: paginatedList, total: filteredList.length } })
})

// 获取单个订单
router.get('/:id', (req, res) => {
  const order = dbOps.getOrderById(req.params.id)

  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }

  const product = dbOps.getProductById(order.product_id)

  res.json({ 
    code: 200, 
    data: {
      ...order,
      title: product?.title || '未知商品',
      icon: product?.icon || ''
    }
  })
})

// 发货
router.post('/:id/ship', (req, res) => {
  const { company, trackingNo } = req.body

  dbOps.updateOrder(req.params.id, {
    status: 'shipped',
    tracking_no: trackingNo,
    logistics_company: company,
    ship_time: new Date().toISOString()
  })

  res.json({ code: 200, data: null })
})

export default router
