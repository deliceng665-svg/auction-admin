// pages/detail/detail.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');

Page({
  data: {
    // 商品ID
    goodsId: null,
    
    // 商品信息
    goods: {
      id: null,
      title: '',
      images: [],
      description: '',
      startPrice: 0,
      currentPrice: 0,
      profitRatio: 10,
      status: 0,  // 0-竞拍中 1-已结束
      endTime: null,
      deposit: 100  // 保证金
    },
    
    // 用户状态
    userInfo: null,
    hasPaidDeposit: false,  // 是否已缴纳保证金
    
    // 出价记录
    bidRecords: [],
    loadingBidRecords: false,
    
    // 出价相关
    bidAmount: '',
    bidding: false,
    bidError: '',
    
    // 倒计时
    countdownText: '',
    countdownTimer: null,
    remaining: 0,  // 剩余毫秒数，用于判断是否最后10秒
    
    // 图片预览
    currentImageIndex: 0
  },

  onLoad(options) {
    const goodsId = options.id;
    if (!goodsId) {
      wx.showToast({ title: '商品不存在', icon: 'none' });
      wx.navigateBack();
      return;
    }
    
    this.setData({ goodsId });
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo });
    
    // 加载商品详情
    this.loadGoodsDetail();
    
    // 加载出价记录
    this.loadBidRecords();
  },

  onShow() {
    // 检查保证金状态
    this.checkDepositStatus();
  },

  onUnload() {
    this.clearCountdown();
  },

  onPullDownRefresh() {
    this.loadGoodsDetail();
    this.loadBidRecords();
    wx.stopPullDownRefresh();
  },

  // ========== 商品详情相关 ==========

  loadGoodsDetail() {
    app.showLoading();

    // 调用后端 API
    api.getAuctionDetail(this.data.goodsId).then(data => {
      app.hideLoading();

      const endTime = data.end_time ? new Date(data.end_time).getTime() : null;
      const countdownText = endTime ? util.formatCountdown(endTime - Date.now()) : '已结束';

      this.setData({
        goods: {
          ...data,
          // 适配字段
          title: data.title,
          description: data.description,
          startPrice: data.start_price,
          currentPrice: data.current_price || data.start_price,
          profitRatio: data.profit_ratio,
          deposit: data.deposit,
          bidIncrement: data.bid_increment,
          status: data.status === 'active' ? 0 : 1,
          endTime: endTime,
          countdownText: countdownText,
          icon: data.icon || '📦'
        }
      });

      // 启动倒计时
      this.startCountdown();

      // 设置页面标题
      wx.setNavigationBarTitle({ title: data.title });
    }).catch(err => {
      app.hideLoading();
      // API 失败时使用本地数据
      this.loadLocalDetail();
    });
  },

  // 本地演示数据
  loadLocalDetail() {
    const goodsId = this.data.goodsId;
    const goodsData = {
      1: { title: 'iPhone 15 Pro Max 256GB', icon: '📱', start_price: 5000, current_price: 6800, profit_ratio: 10, deposit: 500, bid_increment: 100, description: '最新款苹果手机，A17 Pro芯片，钛金属设计', end_time: Date.now() + 3600000 * 5, status: 'active' },
      2: { title: 'MacBook Pro 14寸 M3', icon: '💻', start_price: 10000, current_price: 12000, profit_ratio: 8, deposit: 1000, bid_increment: 200, description: '搭载M3芯片，专业级笔记本电脑', end_time: Date.now() + 3600000 * 12, status: 'active' },
      3: { title: 'AirPods Pro 2代', icon: '🎧', start_price: 1000, current_price: 1500, profit_ratio: 12, deposit: 200, bid_increment: 50, description: '主动降噪，空间音频', end_time: Date.now() + 3600000 * 2, status: 'active' }
    };

    const data = goodsData[goodsId] || goodsData[1];
    const endTime = data.end_time;

    this.setData({
      goods: {
        ...data,
        title: data.title,
        startPrice: data.start_price,
        currentPrice: data.current_price,
        profitRatio: data.profit_ratio,
        deposit: data.deposit,
        bidIncrement: data.bid_increment,
        description: data.description,
        status: 0,
        endTime: endTime,
        countdownText: util.formatCountdown(endTime - Date.now())
      }
    });

    this.startCountdown();
    wx.setNavigationBarTitle({ title: data.title });
  },

  // ========== 出价记录相关 ==========

  loadBidRecords() {
    this.setData({ loadingBidRecords: true });
    
    const params = { 
      goodsId: this.data.goodsId,
      page: 1,
      pageSize: 20
    };
    
    // 模拟API
    this.mockApi('/api/goods/bid-records', params).then(data => {
      const records = (data.list || []).map((item, index) => ({
        ...item,
        nickname: util.maskNickname(item.nickname),
        profit: util.calculateProfit(item.bidAmount, index === 0 ? this.data.goods.startPrice : data.list[index - 1].bidAmount, this.data.goods.profitRatio)
      }));
      
      this.setData({
        bidRecords: records,
        loadingBidRecords: false
      });
    }).catch(err => {
      this.setData({ loadingBidRecords: false });
    });
  },

  // ========== 保证金相关 ==========

  checkDepositStatus() {
    if (!this.data.userInfo) {
      this.setData({ hasPaidDeposit: false });
      return;
    }
    
    // 模拟检查保证金状态
    const depositPaid = wx.getStorageSync(`deposit_${this.data.goodsId}_${this.data.userInfo.id}`);
    this.setData({ hasPaidDeposit: depositPaid });
  },

  // 缴纳保证金
  onPayDeposit() {
    if (!this.data.userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            // TODO: 跳转登录
            wx.showToast({ title: '请先登录', icon: 'none' });
          }
        }
      });
      return;
    }
    
    wx.showModal({
      title: '缴纳保证金',
      content: `确定缴纳保证金 ¥${this.data.goods.deposit} 参与竞拍？`,
      success: (res) => {
        if (res.confirm) {
          this.doPayDeposit();
        }
      }
    });
  },

  doPayDeposit() {
    app.showLoading('缴纳中...');
    
    // 模拟支付
    setTimeout(() => {
      app.hideLoading();
      
      // 标记已缴纳保证金
      wx.setStorageSync(`deposit_${this.data.goodsId}_${this.data.userInfo.id}`, true);
      this.setData({ hasPaidDeposit: true });
      
      wx.showToast({
        title: '缴纳成功',
        icon: 'success'
      });
    }, 1000);
  },

  // ========== 出价相关 ==========

  // 出价输入
  onBidInput(e) {
    const value = e.detail.value;
    this.setData({
      bidAmount: value,
      bidError: ''
    });
  },

  // 出价失焦校验
  onBidBlur() {
    const { bidAmount, goods } = this.data;
    if (!bidAmount) return;
    
    const result = util.validateBid(bidAmount, goods.currentPrice);
    if (!result.valid) {
      this.setData({ bidError: result.message });
    }
  },

  // 提交出价
  onSubmitBid() {
    const { bidAmount, goods, hasPaidDeposit, userInfo, bidError } = this.data;
    
    // 检查登录
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '请先登录', icon: 'none' });
          }
        }
      });
      return;
    }
    
    // 检查保证金
    if (!hasPaidDeposit) {
      wx.showModal({
        title: '提示',
        content: '需要先缴纳保证金才能出价',
        confirmText: '去缴纳',
        success: (res) => {
          if (res.confirm) {
            this.onPayDeposit();
          }
        }
      });
      return;
    }
    
    // 检查商品状态
    if (goods.status !== 0) {
      wx.showToast({ title: '竞拍已结束', icon: 'none' });
      return;
    }
    
    // 校验出价金额
    const validation = util.validateBid(bidAmount, goods.currentPrice);
    if (!validation.valid) {
      this.setData({ bidError: validation.message });
      wx.showToast({ title: validation.message, icon: 'none' });
      return;
    }
    
    // 执行出价
    this.doBid();
  },

  doBid() {
    const { bidAmount, goods, userInfo, bidRecords } = this.data;
    
    this.setData({ bidding: true, bidError: '' });
    app.showLoading('出价中...');
    
    // 计算收益
    const previousBid = bidRecords.length > 0 ? bidRecords[0].bidAmount : goods.startPrice;
    const profit = util.calculateProfit(parseFloat(bidAmount), parseFloat(previousBid), goods.profitRatio);
    
    // 模拟API
    setTimeout(() => {
      app.hideLoading();
      
      // 构建新记录
      const newRecord = {
        id: Date.now(),
        userId: userInfo.id,
        nickname: userInfo.nickname,
        bidAmount: parseFloat(bidAmount),
        profit: profit,
        bidTime: new Date().toISOString()
      };
      
      // 更新出价记录
      this.setData({
        bidRecords: [newRecord, ...this.data.bidRecords],
        goods: {
          ...this.data.goods,
          currentPrice: parseFloat(bidAmount)
        },
        bidAmount: '',
        bidding: false
      });
      
      wx.showToast({
        title: '出价成功',
        icon: 'success'
      });
      
      // 发送通知（模拟）
      this.sendNotification('bid_success', {
        goodsId: goods.id,
        bidAmount: parseFloat(bidAmount),
        profit: profit
      });
      
    }, 1000);
  },

  // ========== 倒计时相关 ==========

  startCountdown() {
    this.clearCountdown();
    
    const timer = setInterval(() => {
      const { goods } = this.data;
      if (!goods.endTime) return;
      
      const remaining = goods.endTime - Date.now();
      
      if (remaining <= 0) {
        // 竞拍结束
        this.setData({
          'goods.status': 1,
          countdownText: '已结束'
        });
        this.clearCountdown();
        return;
      }
      
      const countdownText = util.formatCountdown(remaining);
      if (countdownText !== this.data.countdownText) {
        this.setData({ 
          countdownText,
          remaining  // 用于判断是否最后10秒
        });
      }
    }, 1000);
    
    this.setData({ countdownTimer: timer });
  },

  clearCountdown() {
    const { countdownTimer } = this.data;
    if (countdownTimer) {
      clearInterval(countdownTimer);
      this.setData({ countdownTimer: null });
    }
  },

  // ========== 图片预览 ==========

  onPreviewImage(e) {
    const { index } = e.currentTarget.dataset;
    const { goods } = this.data;
    
    wx.previewImage({
      current: goods.images[index],
      urls: goods.images
    });
  },

  onImageChange(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  // ========== 通知相关 ==========

  sendNotification(type, data) {
    // 模拟发送通知
    console.log('发送通知:', type, data);
    // 实际项目中调用后端接口发送订阅消息
  },

  // ========== 模拟API ==========

  mockApi(url, params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (url === '/api/goods/detail') {
          // 模拟商品详情
          const goodsId = params.id;
          resolve({
            goods: {
              id: goodsId,
              title: `商品${goodsId} - iPhone 15 Pro Max 256GB`,
              images: [
                'https://picsum.photos/400/400?random=1',
                'https://picsum.photos/400/400?random=2',
                'https://picsum.photos/400/400?random=3',
                'https://picsum.photos/400/400?random=4'
              ],
              description: '全新未拆封正品保障，支持官方验货。商品全新未使用，原装配件齐全。',
              startPrice: 100,
              currentPrice: 5800,
              profitRatio: 10,
              status: 0,
              endTime: Date.now() + 1000 * 60 * 60 * 2, // 2小时后
              deposit: 100
            }
          });
        } else if (url === '/api/goods/bid-records') {
          // 模拟出价记录
          const records = [];
          let lastAmount = 5800;
          
          for (let i = 0; i < 5; i++) {
            records.push({
              id: Date.now() - i * 1000 * 60 * 5,
              userId: 100 + i,
              nickname: `用户${100 + i}***`,
              bidAmount: lastAmount,
              bidTime: new Date(Date.now() - i * 1000 * 60 * 5).toISOString()
            });
            lastAmount -= 100;
          }
          
          resolve({ list: records, total: records.length });
        }
      }, 500);
    });
  }
});
