import express from 'express'
import cors from 'cors'
import { initDatabase } from './models/db.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import auctionRoutes from './routes/auctions.js'
import orderRoutes from './routes/orders.js'
import depositRoutes from './routes/deposits.js'
import earningsRoutes from './routes/earnings.js'
import withdrawRoutes from './routes/withdrawals.js'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 初始化数据库
initDatabase()

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/auctions', auctionRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/deposits', depositRoutes)
app.use('/api/earnings', earningsRoutes)
app.use('/api/withdrawals', withdrawRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Vercel serverless 导出
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
