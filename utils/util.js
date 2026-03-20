/**
 * 工具函数库
 */

/**
 * 格式化时间
 * @param {string|number|Date} date - 日期
 * @param {string} format - 格式化模板
 * @returns {string}
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
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
}

/**
 * 格式化价格
 * @param {number} price - 价格
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
function formatPrice(price, decimals = 2) {
  if (price === null || price === undefined) return '0.00';
  return parseFloat(price).toFixed(decimals);
}

/**
 * 脱敏手机号
 * @param {string} phone - 手机号
 * @returns {string}
 */
function maskPhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 脱敏昵称
 * @param {string} nickname - 昵称
 * @returns {string}
 */
function maskNickname(nickname) {
  if (!nickname) return '';
  if (nickname.length <= 2) return nickname + '**';
  return nickname[0] + '**' + nickname[nickname.length - 1];
}

/**
 * 倒计时格式化
 * @param {number} timestamp - 剩余时间戳（毫秒）
 * @returns {object}
 */
function countdown(timestamp) {
  if (timestamp <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  
  const seconds = Math.floor(timestamp / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    expired: false
  };
}

/**
 * 格式化倒计时为字符串
 * @param {number} timestamp - 剩余时间戳（毫秒）
 * @returns {string}
 */
function formatCountdown(timestamp) {
  const { days, hours, minutes, seconds, expired } = countdown(timestamp);
  
  if (expired) return '已结束';
  
  let result = '';
  if (days > 0) result += `${days}天`;
  if (hours > 0 || days > 0) result += `${hours}时`;
  if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}分`;
  result += `${seconds}秒`;
  
  return result;
}

/**
 * 计算收益（核心公式）
 * 本次收益 = （当前出价 - 上一次出价）× 收益比例
 * @param {number} currentBid - 当前出价
 * @param {number} previousBid - 上一次出价
 * @param {number} ratio - 收益比例
 * @returns {number}
 */
function calculateProfit(currentBid, previousBid, ratio = 0.1) {
  const diff = parseFloat(currentBid) - parseFloat(previousBid);
  if (diff <= 0) return 0;
  return parseFloat((diff * ratio).toFixed(2));
}

/**
 * 获取订单状态文本
 * @param {number} status - 订单状态
 * @returns {string}
 */
function getOrderStatusText(status) {
  const statusMap = {
    0: '竞拍中',
    1: '中标成功',
    2: '未中标'
  };
  return statusMap[status] || '未知';
}

/**
 * 获取竞拍状态文本
 * @param {number} status - 竞拍状态 0-竞拍中 1-已结束
 * @returns {string}
 */
function getAuctionStatusText(status) {
  const statusMap = {
    0: '竞拍中',
    1: '已结束'
  };
  return statusMap[status] || '未知';
}

/**
 * 验证出价金额
 * @param {number} bid - 出价金额
 * @param {number} currentPrice - 当前价
 * @returns {object} { valid: boolean, message: string }
 */
function validateBid(bid, currentPrice) {
  if (!bid || isNaN(bid)) {
    return { valid: false, message: '请输入出价金额' };
  }
  if (parseFloat(bid) <= parseFloat(currentPrice)) {
    return { valid: false, message: '出价必须高于当前竞拍价' };
  }
  if (parseFloat(bid) <= 0) {
    return { valid: false, message: '出价金额必须大于0' };
  }
  return { valid: true, message: '' };
}

/**
 * 数字千分位格式化
 * @param {number} num - 数字
 * @returns {string}
 */
function formatNumber(num) {
  if (!num) return '0';
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 节流函数
 * @param {function} fn - 执行函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {function}
 */
function throttle(fn, delay = 300) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 防抖函数
 * @param {function} fn - 执行函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {function}
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

module.exports = {
  formatTime,
  formatPrice,
  maskPhone,
  maskNickname,
  countdown,
  formatCountdown,
  calculateProfit,
  getOrderStatusText,
  getAuctionStatusText,
  validateBid,
  formatNumber,
  throttle,
  debounce
};
