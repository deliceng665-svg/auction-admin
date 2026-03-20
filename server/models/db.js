import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '../data')
const dbPath = path.join(dataDir, 'auction.json')

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 内存数据库
let db = {
  merchants: [],
  products: [],
  bids: [],
  orders: [],
  deposits: [],
  earnings: [],
  withdrawals: []
}

// 加载数据
function loadDb() {
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8')
      db = JSON.parse(data)
    } catch (e) {
      console.log('数据库文件损坏，重新创建')
      saveDb()
    }
  } else {
    saveDb()
  }
}

// 保存数据
function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

// ID 生成器
let idCounters = {
  merchants: 0,
  products: 0,
  bids: 0,
  orders: 0,
  deposits: 0,
  earnings: 0,
  withdrawals: 0
}

function getNextId(table) {
  idCounters[table] = (idCounters[table] || 0) + 1
  return idCounters[table]
}

// 初始化
export function initDatabase() {
  loadDb()

  // 初始化 ID 计数器
  if (db.merchants.length) idCounters.merchants = Math.max(...db.merchants.map(m => m.id))
  if (db.products.length) idCounters.products = Math.max(...db.products.map(p => p.id))
  if (db.bids.length) idCounters.bids = Math.max(...db.bids.map(b => b.id))
  if (db.orders.length) idCounters.orders = Math.max(...db.orders.map(o => o.id))
  if (db.deposits.length) idCounters.deposits = Math.max(...db.deposits.map(d => d.id))
  if (db.earnings.length) idCounters.earnings = Math.max(...db.earnings.map(e => e.id))
  if (db.withdrawals.length) idCounters.withdrawals = Math.max(...db.withdrawals.map(w => w.id))

  // 插入演示商家
  if (!db.merchants.find(m => m.phone === '13800000000')) {
    db.merchants.push({
      id: getNextId('merchants'),
      phone: '13800000000',
      password: '123456',
      name: '演示商家',
      created_at: new Date().toISOString()
    })
    saveDb()
    console.log('✅ 演示商家已创建: 13800000000 / 123456')
  }

  console.log('✅ 数据库初始化完成')
  return db
}

// 模拟 better-sqlite3 的 API
export const getDb = () => db
export const runQuery = (sql, params) => { /* not used */ }

export default {
  prepare: (sql) => ({
    run: (...params) => {
      // 简化处理：直接保存
      saveDb()
      return { changes: 1, lastInsertRowid: 1 }
    },
    get: (...params) => {
      return null
    },
    all: (...params) => {
      return []
    }
  }),
  exec: (sql) => {
    saveDb()
  }
}

// 便捷方法
export const dbOps = {
  // 商家操作
  findMerchant: (phone) => db.merchants.find(m => m.phone === phone),
  findMerchantById: (id) => db.merchants.find(m => m.id === id),
  createMerchant: (data) => {
    const merchant = { id: getNextId('merchants'), ...data, created_at: new Date().toISOString() }
    db.merchants.push(merchant)
    saveDb()
    return merchant
  },

  // 商品操作
  getProducts: (filter = {}) => {
    let products = [...db.products]
    if (filter.merchant_id) products = products.filter(p => p.merchant_id === filter.merchant_id)
    if (filter.status) products = products.filter(p => p.status === filter.status)
    return products.sort((a, b) => b.id - a.id)
  },
  getProductById: (id) => db.products.find(p => p.id === parseInt(id)),
  createProduct: (data) => {
    const product = { 
      id: getNextId('products'), 
      ...data, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    db.products.push(product)
    saveDb()
    return product
  },
  updateProduct: (id, data) => {
    const index = db.products.findIndex(p => p.id === parseInt(id))
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...data, updated_at: new Date().toISOString() }
      saveDb()
      return db.products[index]
    }
    return null
  },
  deleteProduct: (id) => {
    db.products = db.products.filter(p => p.id !== parseInt(id))
    saveDb()
  },

  // 出价操作
  getBids: (productId) => db.bids.filter(b => b.product_id === parseInt(productId)).sort((a, b) => b.price - a.price),
  createBid: (data) => {
    const bid = { id: getNextId('bids'), ...data, created_at: new Date().toISOString() }
    db.bids.push(bid)
    saveDb()
    return bid
  },
  getHighestBid: (productId) => {
    const bids = db.bids.filter(b => b.product_id === parseInt(productId))
    return bids.length ? bids.reduce((max, b) => b.price > max.price ? b : max) : null
  },

  // 订单操作
  getOrders: (filter = {}) => {
    let orders = [...db.orders]
    if (filter.merchant_id) {
      // 需要关联查询，这里简化处理
      const merchantProducts = db.products.filter(p => p.merchant_id === filter.merchant_id).map(p => p.id)
      orders = orders.filter(o => merchantProducts.includes(o.product_id))
    }
    if (filter.status) orders = orders.filter(o => o.status === filter.status)
    return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },
  getOrderById: (id) => db.orders.find(o => o.id === parseInt(id)),
  createOrder: (data) => {
    const order = { id: getNextId('orders'), ...data, created_at: new Date().toISOString() }
    db.orders.push(order)
    saveDb()
    return order
  },
  updateOrder: (id, data) => {
    const index = db.orders.findIndex(o => o.id === parseInt(id))
    if (index !== -1) {
      db.orders[index] = { ...db.orders[index], ...data }
      saveDb()
      return db.orders[index]
    }
    return null
  },

  // 收益操作
  getEarnings: (filter = {}) => {
    let earnings = [...db.earnings]
    if (filter.merchant_id) {
      const merchantProducts = db.products.filter(p => p.merchant_id === filter.merchant_id).map(p => p.id)
      earnings = earnings.filter(e => merchantProducts.includes(e.product_id))
    }
    return earnings.sort((a, b) => new Date(b.order_time) - new Date(a.order_time))
  },
  createEarning: (data) => {
    const earning = { id: getNextId('earnings'), ...data, order_time: new Date().toISOString() }
    db.earnings.push(earning)
    saveDb()
    return earning
  },

  // 提现操作
  getWithdrawals: (merchantId) => db.withdrawals.filter(w => w.merchant_id === merchantId).sort((a, b) => new Date(b.create_time) - new Date(a.create_time)),
  createWithdrawal: (data) => {
    const withdrawal = { id: getNextId('withdrawals'), ...data, create_time: new Date().toISOString() }
    db.withdrawals.push(withdrawal)
    saveDb()
    return withdrawal
  },
  updateWithdrawal: (id, data) => {
    const index = db.withdrawals.findIndex(w => w.id === parseInt(id))
    if (index !== -1) {
      db.withdrawals[index] = { ...db.withdrawals[index], ...data }
      saveDb()
      return db.withdrawals[index]
    }
    return null
  }
}
