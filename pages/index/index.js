// pages/index/index.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');

Page({
  data: {
    // 搜索
    searchKeyword: '',
    
    // 分类 - 带图标
    categories: [
      { id: 0, name: '全部', icon: '🏠' },
      { id: 1, name: '手机', icon: '📱' },
      { id: 2, name: '数码', icon: '💻' },
      { id: 3, name: '家电', icon: '📺' },
      { id: 4, name: '电脑', icon: '🖥️' },
      { id: 5, name: '办公', icon: '📠' },
      { id: 6, name: '耳机', icon: '🎧' },
      { id: 7, name: '手表', icon: '⌚' }
    ],
    activeCategoryId: 0,
    
    // 商品列表
    goodsList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    
    // 倒计时相关
    countdownTimers: {}
  },

  onLoad() {
    this.loadGoodsList();
  },

  // 搜索栏点击
  onSearchTap() {
    wx.showToast({
      title: '点击搜索',
      icon: 'none'
    });
  },

  onShow() {
    // 页面显示时刷新列表
    this.refreshList();
  },

  onUnload() {
    // 清除所有倒计时
    this.clearAllCountdowns();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshList();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  // 图片加载失败处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const key = `goodsList[${index}].imageError`;
    this.setData({ [key]: true });
  },

  // ========== 搜索相关 ==========

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 触发搜索
  onSearch() {
    const keyword = this.data.searchKeyword.trim();
    this.setData({
      page: 1,
      goodsList: [],
      hasMore: true
    });
    this.loadGoodsList(keyword);
  },

  // 清除搜索
  onClearSearch() {
    this.setData({
      searchKeyword: '',
      page: 1,
      goodsList: [],
      hasMore: true
    });
    this.loadGoodsList();
  },

  // ========== 分类相关 ==========

  // 切换分类
  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id;
    if (categoryId === this.data.activeCategoryId) return;
    
    this.setData({
      activeCategoryId: categoryId,
      page: 1,
      goodsList: [],
      hasMore: true
    });
    this.loadGoodsList();
  },

  // ========== 商品列表相关 ==========

  // 刷新列表
  refreshList() {
    this.setData({
      page: 1,
      goodsList: [],
      hasMore: true
    });
    this.loadGoodsList();
    this.startCountdowns();
  },

  // 加载商品列表
  loadGoodsList(keyword) {
    if (this.data.loading) return;

    this.setData({ loading: true });
    app.showLoading();

    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      status: 'active',
      keyword: keyword || undefined
    };

    // 调用后端 API
    api.getGoodsList(params).then(data => {
      app.hideLoading();

      const newList = (data.list || []).map(item => ({
        ...item,
        // 适配小程序字段
        profitRatio: item.profit_ratio,
        startPrice: item.start_price,
        currentPrice: item.current_price || item.start_price,
        endTime: item.end_time ? new Date(item.end_time).getTime() : null,
        icon: item.icon || '📦'
      }));

      const allList = this.data.page === 1 ? newList : [...this.data.goodsList, ...newList];

      this.setData({
        goodsList: allList,
        hasMore: newList.length >= this.data.pageSize,
        loading: false
      });

      // 启动倒计时
      this.startCountdowns();
    }).catch(err => {
      app.hideLoading();
      this.setData({ loading: false });
      // API 失败时使用本地数据
      this.loadLocalData();
    });
  },

  // 加载本地演示数据（API 不可用时）
  loadLocalData() {
    const mockList = [];
    const startId = (this.data.page - 1) * this.data.pageSize;
    const categoryIcons = { 0: '🛍️', 1: '📱', 2: '💻', 3: '📺', 4: '🖥️', 5: '📠', 6: '🎧', 7: '⌚' };

    for (let i = 0; i < this.data.pageSize; i++) {
      const id = startId + i + 1;
      const categoryId = (i % 7) + 1;
      const catIcon = categoryIcons[categoryId] || '🛒';

      mockList.push({
        id: id,
        title: `商品${id} - ${this.getCategoryName(categoryId)}`,
        image: '',
        icon: catIcon,
        startPrice: 100,
        currentPrice: 100 + Math.floor(Math.random() * 500),
        profitRatio: 10,
        status: 0,
        endTime: Date.now() + 1000 * 60 * 60 * (Math.random() * 24 + 1),
        categoryId: categoryId,
        countdownText: util.formatCountdown(Date.now() + 1000 * 60 * 60 * Math.random() * 24),
        remaining: Date.now() + 1000 * 60 * 60 * Math.random() * 24
      });
    }

    const allList = this.data.page === 1 ? mockList : [...this.data.goodsList, ...mockList];
    this.setData({
      goodsList: allList,
      hasMore: this.data.page < 3,
      loading: false
    });
    this.startCountdowns();
  },

  // 加载更多
  loadMore() {
    this.setData({
      page: this.data.page + 1
    });
    this.loadGoodsList();
  },

  // 点击商品卡片
  onGoodsTap(e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${goodsId}`
    });
  },

  // ========== 倒计时相关 ==========

  // 启动所有倒计时
  startCountdowns() {
    this.clearAllCountdowns();
    
    this.data.goodsList.forEach(item => {
      if (item.status === 0 && item.endTime) {
        const timer = setInterval(() => {
          this.updateCountdown(item.id, item.endTime);
        }, 1000);
        
        this.data.countdownTimers[item.id] = timer;
      }
    });
  },

  // 更新单个倒计时
  updateCountdown(goodsId, endTime) {
    const now = Date.now();
    const remaining = endTime - now;
    
    const goodsIndex = this.data.goodsList.findIndex(item => item.id === goodsId);
    if (goodsIndex === -1) return;
    
    const goods = this.data.goodsList[goodsIndex];
    const formatted = util.formatCountdown(remaining);
    
    if (remaining <= 0 && goods.status === 0) {
      // 竞拍结束，更新状态
      const newList = [...this.data.goodsList];
      newList[goodsIndex] = { ...goods, status: 1 };
      this.setData({ goodsList: newList });
      return;
    }
    
    if (formatted !== goods.countdownText) {
      const newList = [...this.data.goodsList];
      newList[goodsIndex] = { 
        ...goods, 
        countdownText: formatted,
        remaining: remaining
      };
      this.setData({ goodsList: newList });
    }
  },

  // 清除所有倒计时
  clearAllCountdowns() {
    Object.values(this.data.countdownTimers).forEach(timer => {
      clearInterval(timer);
    });
    this.setData({ countdownTimers: {} });
  },

  // ========== 模拟API ==========
  mockApi(url, params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟数据
        const mockList = [];
        const startId = (params.page - 1) * params.pageSize;
        
        for (let i = 0; i < params.pageSize; i++) {
          const id = startId + i + 1;
          const categoryId = params.categoryId || (i % 5) + 1;
          
          // 模拟部分商品已结束
          const status = Math.random() > 0.7 ? 1 : 0;
          const endTime = status === 1 
            ? Date.now() - 1000 * 60 * 30  // 已结束
            : Date.now() + 1000 * 60 * 60 * (Math.random() * 24 + 1); // 进行中
          
          // 分类对应的 emoji 图标（本地展示，不依赖外部图片）
          const categoryIcons = {
            0: '🛍️', 1: '📱', 2: '💻', 3: '📺', 4: '🖥️', 5: '📠', 6: '🎧', 7: '⌚'
          };
          const catId = params.categoryId || (i % 7) + 1;
          const catIcon = categoryIcons[catId] || '🛒';

          mockList.push({
            id: id,
            title: `商品${id} - ${this.getCategoryName(categoryId)}`,
            image: '',   // 不依赖外部图片，使用本地占位
            icon: catIcon,
            startPrice: 100,
            currentPrice: 100 + Math.floor(Math.random() * 500),
            profitRatio: 10,
            status: status,
            endTime: endTime,
            categoryId: categoryId,
            countdownText: util.formatCountdown(endTime - Date.now()),
            remaining: endTime - Date.now()
          });
        }
        
        resolve({
          list: mockList,
          total: 50
        });
      }, 500);
    });
  },

  getCategoryName(categoryId) {
    const categories = this.data.categories;
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : '商品';
  }
});
