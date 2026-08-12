/**
 * 通用工具函数
 */

/**
 * 格式化日期为字符串
 * @param {Date} date
 * @param {string} format - 如 'YYYY-MM-DD'
 * @returns {string}
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute);
};

/**
 * 生成唯一 ID
 * @param {string} prefix - 前缀
 * @returns {string}
 */
const generateId = (prefix = 'id') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * 获取未来 N 天的日期列表
 * @param {number} days - 天数
 * @returns {Array<{date: Date, dateStr: string, dayOfWeek: string, isToday: boolean}>}
 */
const getUpcomingDays = (days = 7) => {
  const result = [];
  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    result.push({
      date: date,
      dateStr: formatDate(date),
      dayOfWeek: weekNames[date.getDay()],
      isToday: i === 0,
      dateFormatted: `${date.getMonth() + 1}/${date.getDate()}`
    });
  }

  return result;
};

/**
 * 获取可选时段列表（模拟）
 * @param {Date} date - 选择的日期
 * @param {number} requiredDuration - 所需时长（分钟）
 * @returns {Array<{timeSlot: string, available: boolean, reason?: string}>}
 */
const getTimeSlots = (date, requiredDuration = 60) => {
  const allSlots = [
    { timeSlot: '09:00-10:30', start: '09:00', end: '10:30', available: true },
    { timeSlot: '10:30-12:00', start: '10:30', end: '12:00', available: true },
    { timeSlot: '12:00-13:30', start: '12:00', end: '13:30', available: true },
    { timeSlot: '13:30-15:00', start: '13:30', end: '15:00', available: true },
    { timeSlot: '15:00-16:30', start: '15:00', end: '16:30', available: true },
    { timeSlot: '16:30-18:00', start: '16:30', end: '18:00', available: true },
    { timeSlot: '18:00-19:30', start: '18:00', end: '19:30', available: true },
    { timeSlot: '19:30-21:00', start: '19:30', end: '21:00', available: true }
  ];

  // 模拟：周末下午时段约满
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;

  return allSlots.map(slot => {
    if (isWeekend && (slot.start === '13:30' || slot.start === '15:00')) {
      return { ...slot, available: false, reason: '已约满' };
    }
    // 如果所选项目时长超过时段长度，标记不可用
    const slotHours = parseFloat(slot.end) - parseFloat(slot.start);
    if (requiredDuration > slotHours * 60 + 30) {
      return { ...slot, available: false, reason: '时长不足' };
    }
    return slot;
  });
};

/**
 * 格式化金额
 * @param {number} cents
 * @returns {string}
 */
const formatPrice = (price) => {
  return `¥${price}`;
};

/**
 * 格式化时长
 * @param {number} minutes
 * @returns {string}
 */
const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

/**
 * 获取预约状态文字
 * @param {string} status
 * @returns {{label: string, color: string}}
 */
const getBookingStatus = (status) => {
  const statusMap = {
    'pending': { label: '待确认', color: '#C4A882' },
    'confirmed': { label: '已确认', color: '#7EBF8E' },
    'completed': { label: '已完成', color: '#9B8585' },
    'cancelled': { label: '已取消', color: '#C4B5B5' }
  };
  return statusMap[status] || { label: '未知', color: '#C4B5B5' };
};

/**
 * 防抖函数
 * @param {function} fn
 * @param {number} delay - 毫秒
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

module.exports = {
  formatDate,
  generateId,
  getUpcomingDays,
  getTimeSlots,
  formatPrice,
  formatDuration,
  getBookingStatus,
  debounce
};
