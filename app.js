// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    // 收益比例配置（从后端获取）
    profitRatio: 0.1,
    // 最低保证金（从后端获取）
    minDeposit: 100,
    // 最低提现金额（从后端获取）
    minWithdraw: 10
  },
  
  onLaunch() {
    // 登录检查
    this.checkLogin();
    // 获取系统信息
    this.getSystemInfo();
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
  },

  // 获取系统信息
  getSystemInfo() {
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.statusBarHeight = systemInfo.statusBarHeight;
    this.globalData.navBarHeight = 44;
  },

  // 登录
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          // 调用后端登录接口
          this.request({
            url: '/api/login',
            method: 'POST',
            data: { code: res.code }
          }).then(result => {
            this.globalData.token = result.token;
            this.globalData.userInfo = result.userInfo;
            wx.setStorageSync('token', result.token);
            wx.setStorageSync('userInfo', result.userInfo);
            resolve(result);
          }).catch(reject);
        },
        fail: reject
      });
    });
  },

  // 统一请求封装
  request(options) {
    const app = this;
    return new Promise((resolve, reject) => {
      const header = options.header || {};
      header['Authorization'] = 'Bearer ' + app.globalData.token;
      
      wx.request({
        url: (options.baseUrl || 'https://api.example.com') + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: header,
        success: (res) => {
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            //  token过期
            if (res.data.code === 401) {
              app.login().then(() => {
                // 重试请求
                app.request(options).then(resolve).catch(reject);
              });
            } else {
              wx.showToast({
                title: res.data.message || '请求失败',
                icon: 'none'
              });
              reject(res.data);
            }
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  },

  // 显示加载中
  showLoading(title = '加载中') {
    wx.showLoading({ title, mask: true });
  },

  // 隐藏加载
  hideLoading() {
    wx.hideLoading();
  },

  // 格式化价格
  formatPrice(price) {
    return parseFloat(price).toFixed(2);
  },

  // 格式化时间
  formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hour)
      .replace('mm', minute)
      .replace('ss', second);
  },

  // 脱敏手机号
  maskPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },

  // 脱敏昵称
  maskNickname(nickname) {
    if (!nickname) return '';
    if (nickname.length <= 2) return nickname + '**';
    return nickname[0] + '**' + nickname[nickname.length - 1];
  }
});
