// 小程序 API 请求封装
// 注意：开发环境请使用本地 IP 地址，如 'http://192.168.1.x:3001/api'
// 生产环境请改为实际服务器地址
const API_BASE = 'http://localhost:3001/api'

/**
 * 发送请求
 */
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        // 如果需要登录 token，可以从这里获取
        // 'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success(res) {
        if (res.data.code === 200) {
          resolve(res.data.data)
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail(err) {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// ========== 商品相关 API ==========

// 获取商品列表
export function getGoodsList(params) {
  return request('/products', 'GET', params)
}

// 获取商品详情
export function getGoodsDetail(id) {
  return request(`/products/${id}`, 'GET')
}

// 获取竞拍列表
export function getAuctionList(params) {
  return request('/auctions', 'GET', params)
}

// 获取竞拍详情
export function getAuctionDetail(id) {
  return request(`/auctions/${id}`, 'GET')
}

// 获取出价记录
export function getAuctionBids(id) {
  return request(`/auctions/${id}/bids`, 'GET')
}

// 出价
export function placeBid(data) {
  return request('/bids', 'POST', data)
}

// 获取订单列表
export function getOrderList(params) {
  return request('/orders', 'GET', params)
}

// 支付保证金
export function payDeposit(data) {
  return request('/deposits', 'POST', data)
}

// 获取收益
export function getEarnings(params) {
  return request('/earnings', 'GET', params)
}

export default {
  request,
  getGoodsList,
  getGoodsDetail,
  getAuctionList,
  getAuctionDetail,
  getAuctionBids,
  placeBid,
  getOrderList,
  payDeposit,
  getEarnings
}
