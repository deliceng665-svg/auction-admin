// pages/profile/profile.js
const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    // 用户信息
    userInfo: null,
    loggedIn: false,
    
    // 收益数据
    profit: {
      totalProfit: 0,
      availableAmount: 0,
      frozenAmount: 0
    },
    
    // 订单列表
    orders: [],
    orderPage: 1,
    orderPageSize: 10,
    hasMoreOrders: true,
    loadingOrders: false,
    
    // 收益明细
    profitRecords: [],
    profitPage: 1,
    profitPageSize: 10,
    hasMoreProfits: true,
    loadingProfits: false,
    
    // 当前Tab
    currentTab: 'orders',  // orders-订单 profits-收益
    
    // 订单状态映射
    orderStatusMap: {
      0: { text: '竞拍中', class: 'status-active' },
      1: { text: '中标成功', class: 'status-success' },
      2: { text: '未中标', class: 'status-failed' }
    }
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    if (this.data.loggedIn) {
      this.loadUserInfo();
      this.loadOrders();
    }
  },

  onPullDownRefresh() {
    if (this.data.loggedIn) {
      this.loadUserInfo();
      if (this.data.currentTab === 'orders') {
        this.setData({ orderPage: 1, orders: [], hasMoreOrders: true });
        this.loadOrders();
      } else {
        this.setData({ profitPage: 1, profitRecords: [], hasMoreProfits: true });
        this.loadProfitRecords();
      }
    }
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.data.loggedIn) return;
    
    if (this.data.currentTab === 'orders') {
      if (this.data.hasMoreOrders && !this.data.loadingOrders) {
        this.loadMoreOrders();
      }
    } else {
      if (this.data.hasMoreProfits && !this.data.loadingProfits) {
        this.loadMoreProfits();
      }
    }
  },

  // ========== 登录相关 ==========

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        loggedIn: true
      });
      this.loadUserInfo();
      this.loadOrders();
    } else {
      this.setData({
        userInfo: null,
        loggedIn: false
      });
    }
  },

  // 点击登录
  onLogin() {
    // 模拟登录
    const mockUserInfo = {
      id: 1001,
      nickname: '测试用户',
      avatar: 'https://picsum.photos/100/100?random=999'
    };
    
    wx.setStorageSync('userInfo', mockUserInfo);
    this.setData({
      userInfo: mockUserInfo,
      loggedIn: true
    });
    
    this.loadUserInfo();
    this.loadOrders();
  },

  // ========== 用户信息相关 ==========

  loadUserInfo() {
    // 模拟获取用户信息
    this.mockApi('/api/user/info').then(data => {
      this.setData({
        profit: data.profit || {
          totalProfit: 0,
          availableAmount: 0,
          frozenAmount: 0
        }
      });
    });
  },

  // ========== 订单相关 ==========

  loadOrders() {
    if (this.data.loadingOrders) return;
    
    this.setData({ loadingOrders: true });
    
    const params = {
      page: this.data.orderPage,
      pageSize: this.data.orderPageSize
    };
    
    this.mockApi('/api/user/orders', params).then(data => {
      const newOrders = data.list || [];
      const allOrders = this.data.orderPage === 1 ? newOrders : [...this.data.orders, ...newOrders];
      
      this.setData({
        orders: allOrders,
        hasMoreOrders: newOrders.length >= this.data.orderPageSize,
        loadingOrders: false
      });
    }).catch(() => {
      this.setData({ loadingOrders: false });
    });
  },

  loadMoreOrders() {
    this.setData({ orderPage: this.data.orderPage + 1 });
    this.loadOrders();
  },

  // 点击订单
  onOrderTap(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${orderId}`
    });
  },

  // 去支付（中标后）
  onPayOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认支付',
      content: '确定要支付此订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.doPayOrder(orderId);
        }
      }
    });
  },

  doPayOrder(orderId) {
    app.showLoading('支付中...');
    
    setTimeout(() => {
      app.hideLoading();
      wx.showToast({ title: '支付成功', icon: 'success' });
      
      // 更新订单状态
      const newOrders = this.data.orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: 3, statusText: '已支付' };
        }
        return order;
      });
      
      this.setData({ orders: newOrders });
    }, 1000);
  },

  // ========== 收益相关 ==========

  // 切换Tab
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    
    this.setData({ currentTab: tab });
    
    if (tab === 'profits' && this.data.profitRecords.length === 0) {
      this.loadProfitRecords();
    }
  },

  loadProfitRecords() {
    if (this.data.loadingProfits) return;
    
    this.setData({ loadingProfits: true });
    
    const params = {
      page: this.data.profitPage,
      pageSize: this.data.profitPageSize
    };
    
    this.mockApi('/api/user/profit-records', params).then(data => {
      const newRecords = data.list || [];
      const allRecords = this.data.profitPage === 1 ? newRecords : [...this.data.profitRecords, ...newRecords];
      
      this.setData({
        profitRecords: allRecords,
        hasMoreProfits: newRecords.length >= this.data.profitPageSize,
        loadingProfits: false
      });
    }).catch(() => {
      this.setData({ loadingProfits: false });
    });
  },

  loadMoreProfits() {
    this.setData({ profitPage: this.data.profitPage + 1 });
    this.loadProfitRecords();
  },

  // 提现
  onWithdraw() {
    const { profit } = this.data;
    
    if (profit.availableAmount < 10) {
      wx.showToast({ title: '最低提现金额10元', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '提现',
      content: `可提现金额 ¥${profit.availableAmount}`,
      editable: true,
      placeholderText: '输入提现金额',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseFloat(res.content);
          if (amount > profit.availableAmount) {
            wx.showToast({ title: '余额不足', icon: 'none' });
            return;
          }
          if (amount < 10) {
            wx.showToast({ title: '最低提现10元', icon: 'none' });
            return;
          }
          this.doWithdraw(amount);
        }
      }
    });
  },

  doWithdraw(amount) {
    app.showLoading('提现中...');
    
    setTimeout(() => {
      app.hideLoading();
      wx.showToast({ title: '提现申请已提交', icon: 'success' });
      
      // 更新余额
      this.setData({
        'profit.availableAmount': this.data.profit.availableAmount - amount,
        'profit.frozenAmount': this.data.profit.frozenAmount + amount
      });
    }, 1000);
  },

  // ========== 模拟API ==========

  mockApi(url, params = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (url === '/api/user/info') {
          resolve({
            profit: {
              totalProfit: 1580.50,
              availableAmount: 1280.50,
              frozenAmount: 300.00
            }
          });
        } else if (url === '/api/user/orders') {
          const orders = [];
          const startId = (params.page - 1) * params.pageSize;
          
          for (let i = 0; i < params.pageSize; i++) {
            const id = startId + i + 1;
            const status = i % 3;
            
            orders.push({
              id: id,
              goodsId: id,
              title: `商品${id} - iPhone 15 Pro`,
              image: `https://picsum.photos/100/100?random=${id + 100}`,
              status: status,
              statusText: ['竞拍中', '中标成功', '未中标'][status],
              deposit: 100,
              currentPrice: 1000 + i * 100,
              bidTime: new Date(Date.now() - i * 1000 * 60 * 60).toISOString()
            });
          }
          
          resolve({ list: orders, total: 30 });
        } else if (url === '/api/user/profit-records') {
          const records = [];
          const startId = (params.page - 1) * params.pageSize;
          
          for (let i = 0; i < params.pageSize; i++) {
            const id = startId + i + 1;
            records.push({
              id: id,
              goodsId: id,
              goodsTitle: `商品${id}`,
              bidAmount: 1000 + i * 100,
              profit: 10 + i * 10,
              status: i % 3 === 0 ? 0 : 1,  // 0-冻结 1-可用
              statusText: i % 3 === 0 ? '冻结中' : '已结算',
              createTime: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString()
            });
          }
          
          resolve({ list: records, total: 30 });
        }
      }, 500);
    });
  }
});
