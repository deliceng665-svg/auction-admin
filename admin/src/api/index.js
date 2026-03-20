import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    } else {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
  },
  error => {
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request

// ========== API 接口 ==========

// 登录
export const login = (data) => request.post('/auth/login', data)
export const logout = () => request.post('/auth/logout')
export const getUserInfo = () => request.get('/auth/user')

// 商品管理
export const getProducts = (params) => request.get('/products', { params })
export const getProduct = (id) => request.get(`/products/${id}`)
export const createProduct = (data) => request.post('/products', data)
export const updateProduct = (id, data) => request.put(`/products/${id}`, data)
export const deleteProduct = (id) => request.delete(`/products/${id}`)
export const publishProduct = (id) => request.post(`/products/${id}/publish`)

// 竞拍管理
export const getAuctions = (params) => request.get('/auctions', { params })
export const getAuction = (id) => request.get(`/auctions/${id}`)
export const getAuctionBids = (id) => request.get(`/auctions/${id}/bids`)
export const endAuction = (id) => request.post(`/auctions/${id}/end`)

// 订单管理
export const getOrders = (params) => request.get('/orders', { params })
export const getOrder = (id) => request.get(`/orders/${id}`)
export const shipOrder = (id, data) => request.post(`/orders/${id}/ship`, data)

// 保证金
export const getDeposits = (params) => request.get('/deposits', { params })

// 收益
export const getEarnings = (params) => request.get('/earnings', { params })
export const getEarningsSummary = () => request.get('/earnings/summary')
export const getWithdrawList = (params) => request.get('/withdrawals', { params })
export const applyWithdraw = (data) => request.post('/withdrawals', data)
