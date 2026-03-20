// pages/auction/auction.js
const api = require('../../utils/api.js')

Page({
  data: {
    // 竞拍中的商品列表
    auctionList: [],
    // 我的出价记录
    myBids: [],
    // 倒计时相关
    countdownTimers: {}
  },

  onLoad() {
    this.loadAuctionList();
  },

  onShow() {
    this.loadAuctionList();
  },

  onUnload() {
    // 清除所有倒计时
    this.clearAllCountdowns();
  },

  // 加载竞拍商品列表
  loadAuctionList() {
    wx.showLoading({ title: '加载中...' })

    // 调用后端 API
    api.getAuctionList({ status: 'active' }).then(data => {
      wx.hideLoading()

      const auctionList = (data.list || []).map(item => ({
        ...item,
        // 适配字段
        icon: item.icon || '📦',
        profitPercent: item.profit_ratio,
        endTime: item.end_time ? new Date(item.end_time).getTime() : null,
        remaining: item.remaining || 0,
        status: item.status === 'active' ? 'auctioning' : 'ended'
      }))

      this.setData({ auctionList })
      this.startCountdowns()
    }).catch(err => {
      wx.hideLoading()
      // API 失败时使用本地数据
      this.loadLocalData()
    });
  },

  // 本地演示数据
  loadLocalData() {
    const auctionList = [
      {
        id: 1,
        title: 'iPhone 15 Pro Max 256GB',
        image: '',
        icon: '📱',
        currentPrice: 6800,
        startPrice: 5000,
        profitPercent: 10,
        endTime: Date.now() + 3600000 * 5,
        bidCount: 23,
        status: 'auctioning'
      },
      {
        id: 2,
        title: 'MacBook Pro 14寸 M3',
        image: '',
        icon: '💻',
        currentPrice: 12000,
        startPrice: 10000,
        profitPercent: 8,
        endTime: Date.now() + 3600000 * 12,
        bidCount: 15,
        status: 'auctioning'
      },
      {
        id: 3,
        title: 'AirPods Pro 2代',
        image: '',
        icon: '🎧',
        currentPrice: 1500,
        startPrice: 1000,
        profitPercent: 12,
        endTime: Date.now() + 3600000 * 2,
        bidCount: 8,
        status: 'auctioning'
      },
      {
        id: 4,
        title: 'iPad Pro 12.9寸',
        image: '',
        icon: '📱',
        currentPrice: 5800,
        startPrice: 4000,
        profitPercent: 10,
        endTime: Date.now() + 3600000 * 8,
        bidCount: 12,
        status: 'auctioning'
      },
      {
        id: 5,
        title: 'Apple Watch S9',
        image: '',
        icon: '⌚',
        currentPrice: 2200,
        startPrice: 1500,
        profitPercent: 12,
        endTime: Date.now() + 3600000 * 3,
        bidCount: 18,
        status: 'auctioning'
      }
    ];

    this.setData({ auctionList });
    this.startCountdown();
  },

  // 开始倒计时
  startCountdown() {
    const timer = setInterval(() => {
      const list = this.data.auctionList.map(item => {
        const remaining = item.endTime - Date.now();
        if (remaining <= 0) {
          return { ...item, countdownText: '已结束', isUrgent: false };
        }
        
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        return {
          ...item,
          countdownText: `${hours}时${minutes}分${seconds}秒`,
          isUrgent: remaining < 60000 // 最后1分钟红色警示
        };
      });
      
      this.setData({ auctionList: list });
    }, 1000);

    this.setData({ countdownTimer: timer });
  },

  onUnload() {
    clearInterval(this.data.countdownTimer);
  },

  // 查看商品详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});
