import express from 'express'
import { dbOps } from '../models/db.js'

const router = express.Router()

// 获取竞拍列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, status } = req.query
  
  // 获取所有 active 或 ended 状态的产品
  const filter = { status: status || 'active' }
  let products = dbOps.getProducts(filter)
  
  // 如果没有指定状态，获取所有
  if (!status) {
    products = dbOps.getProducts({}).filter(p => ['active', 'ended'].includes(p.status))
  }

  const listWithDetails = products.map(p => {
    const bids = dbOps.getBids(p.id)
    const bidCount = bids.length
    const userCount = new Set(bids.map(b => b.user_id)).size
    const currentBid = bids.length > 0 ? bids[0] : null

    // 计算商家收益
    const earnings = bidCount > 0 ? Math.floor(bidCount * p.profit_ratio * 10) : 0

    // 计算剩余时间
    const remaining = p.end_time ? new Date(p.end_time) - new Date() : 0

    return {
      ...p,
      bidCount,
      userCount,
      currentPrice: currentBid?.price || p.start_price,
      earnings,
      remaining: remaining > 0 ? remaining : -1,
      status: remaining > 0 ? 'active' : 'ended'
    }
  })

  // 分页
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const paginatedList = listWithDetails.slice(offset, offset + parseInt(pageSize))

  res.json({ code: 200, data: { list: paginatedList, total: listWithDetails.length } })
})

// 获取竞拍详情
router.get('/:id', (req, res) => {
  const product = dbOps.getProductById(req.params.id)

  if (!product) {
    return res.json({ code: 404, message: '竞拍不存在' })
  }

  const bids = dbOps.getBids(product.id)
  const bidCount = bids.length
  const userCount = new Set(bids.map(b => b.user_id)).size
  const currentBid = bids.length > 0 ? bids[0] : null
  const lastBid = bids.length > 1 ? bids[1] : null

  const remaining = product.end_time ? new Date(product.end_time) - new Date() : 0

  res.json({
    code: 200,
    data: {
      ...product,
      bidCount,
      userCount,
      currentPrice: currentBid?.price || product.start_price,
      lastPrice: lastBid?.price || product.start_price,
      remaining: remaining > 0 ? remaining : -1,
      status: remaining > 0 ? 'active' : 'ended'
    }
  })
})

// 获取出价记录
router.get('/:id/bids', (req, res) => {
  const bids = dbOps.getBids(req.params.id)

  // 标记领先者和出局者
  const sortedBids = [...bids].sort((a, b) => b.price - a.price)
  const winnerId = sortedBids[0]?.id

  const bidsWithStatus = bids.map((bid, index) => {
    const higherBids = sortedBids.slice(0, index).filter(b => b.price > bid.price)
    return {
      ...bid,
      isWinner: bid.id === winnerId,
      isOutbid: higherBids.length > 0
    }
  })

  res.json({ code: 200, data: bidsWithStatus })
})

// 结束竞拍
router.post('/:id/end', (req, res) => {
  const product = dbOps.getProductById(req.params.id)

  if (!product) {
    return res.json({ code: 404, message: '竞拍不存在' })
  }

  // 检查是否有人出价
  const bids = dbOps.getBids(req.params.id)
  const hasBids = bids.length > 0

  if (hasBids) {
    dbOps.updateProduct(req.params.id, { status: 'ended' })
  } else {
    dbOps.updateProduct(req.params.id, { status: 'closed' })
  }

  res.json({ code: 200, data: null })
})

export default router
