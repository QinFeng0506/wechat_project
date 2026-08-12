/**
 * 小程序入口 — 悦指间美甲（二期扩展）
 * 积分系统 + 管理员检测 + 本地/云双模式
 */

App({
  globalData: {
    userInfo: null,
    phoneNumber: '',
    openid: '',
    favorites: [],
    bookings: [],
    cartItems: [],
    db: null,
    cloudReady: false,
    // 二期新增
    points: 0,
    pointsBalance: 0,
    todaySigned: false,
    signStreak: 0,
    isAdmin: false,
    systemInfo: {},
    statusBarHeight: 0,
    navBarHeight: 0
  },

  onLaunch() {
    this.getSystemInfo();
    this.initCloud();
    this.initPointsData();
  },

  /** 云开发初始化（未开通时静默跳过） */
  initCloud() {
    if (!wx.cloud) {
      this.useLocalMode();
      return;
    }
    try {
      wx.cloud.init({ traceUser: true });
      this.globalData.db = wx.cloud.database();
      this.globalData.cloudReady = true;
      this.checkAdmin();
    } catch (e) {
      this.useLocalMode();
    }
  },

  useLocalMode() {
    this.globalData.cloudReady = false;
    this.globalData.db = null;
    this.restoreFromStorage();
  },

  /** 初始化积分数据（本地模式） */
  initPointsData() {
    try {
      const pts = wx.getStorageSync('points_balance');
      if (pts) this.globalData.pointsBalance = parseInt(pts);
      const today = wx.getStorageSync('sign_date');
      const streak = wx.getStorageSync('sign_streak');
      this.globalData.todaySigned = (today === this.getDateStr());
      this.globalData.signStreak = streak ? parseInt(streak) : 0;
    } catch (e) { /* ignore */ }
  },

  getSystemInfo() {
    const info = wx.getSystemInfoSync();
    this.globalData.systemInfo = info;
    this.globalData.statusBarHeight = info.statusBarHeight;
    this.globalData.navBarHeight = info.statusBarHeight + 44;
  },

  restoreFromStorage() {
    try {
      const fav = wx.getStorageSync('favorites');
      if (fav) this.globalData.favorites = JSON.parse(fav);
      const bk = wx.getStorageSync('bookings');
      if (bk) this.globalData.bookings = JSON.parse(bk);
      const ui = wx.getStorageSync('userInfo');
      if (ui) this.globalData.userInfo = JSON.parse(ui);
    } catch (e) { /* ignore */ }
  },

  getDateStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  // ===== 积分系统 =====

  /** 每日签到 */
  checkIn() {
    if (this.globalData.todaySigned) return { success: false, msg: '今日已签到' };

    const rules = { signInDaily: 5, signInStreak7: 15 };
    let bonus = rules.signInDaily;
    let streak = this.globalData.signStreak + 1;
    if (streak > 7) streak = 1;
    if (streak === 7) bonus += rules.signInStreak7;

    this.globalData.todaySigned = true;
    this.globalData.signStreak = streak;
    this.globalData.pointsBalance += bonus;

    wx.setStorageSync('sign_date', this.getDateStr());
    wx.setStorageSync('sign_streak', streak);
    wx.setStorageSync('points_balance', this.globalData.pointsBalance);
    this.savePointsRecord('earn', 'sign_in', bonus, `第${streak}天签到`);

    return { success: true, msg: `签到成功 +${bonus}`, bonus, streak };
  },

  /** 发放消费积分 */
  grantConsumePoints(amount) {
    const pts = Math.floor(amount);
    this.globalData.pointsBalance += pts;
    wx.setStorageSync('points_balance', this.globalData.pointsBalance);
    this.savePointsRecord('earn', 'consume', pts, `消费赠送 ${amount}元`);
    return pts;
  },

  /** 消耗积分 */
  spendPoints(amount, desc) {
    if (this.globalData.pointsBalance < amount) return false;
    this.globalData.pointsBalance -= amount;
    wx.setStorageSync('points_balance', this.globalData.pointsBalance);
    this.savePointsRecord('spend', 'exchange', -amount, desc);
    return true;
  },

  /** 保存积分记录 */
  savePointsRecord(type, source, amount, desc) {
    const records = JSON.parse(wx.getStorageSync('points_records') || '[]');
    records.unshift({
      type, source, amount,
      balance: this.globalData.pointsBalance,
      description: desc,
      time: new Date().toISOString()
    });
    wx.setStorageSync('points_records', JSON.stringify(records));
  },

  /** 获取积分记录 */
  getPointsRecords() {
    return JSON.parse(wx.getStorageSync('points_records') || '[]');
  },

  // ===== 管理员 =====

  /** 检测管理员 */
  checkAdmin() {
    // 本地模式：通过 storage 标记
    const adminFlag = wx.getStorageSync('is_admin');
    if (adminFlag) {
      this.globalData.isAdmin = true;
      return;
    }
    // 云开发模式：查询 admin_users 表
    if (this.globalData.cloudReady) {
      this.globalData.db.collection('admin_users')
        .where({ role: 'admin' }).limit(1).get()
        .then(res => {
          this.globalData.isAdmin = res.data.length > 0;
          wx.setStorageSync('is_admin', true);
        }).catch(() => {});
    }
  },

  // ===== 收藏 =====

  toggleFavorite(styleId) {
    const favs = this.globalData.favorites;
    const idx = favs.indexOf(styleId);
    if (idx > -1) { favs.splice(idx, 1); this.saveFavs(); return Promise.resolve(false); }
    else { favs.push(styleId); this.saveFavs(); return Promise.resolve(true); }
  },
  isFavorite(id) { return this.globalData.favorites.indexOf(id) > -1; },
  saveFavs() { wx.setStorageSync('favorites', JSON.stringify(this.globalData.favorites)); },

  // ===== 预约 =====

  addBooking(booking) {
    booking._id = 'local_' + Date.now();
    this.globalData.bookings.unshift(booking);
    wx.setStorageSync('bookings', JSON.stringify(this.globalData.bookings));
    return Promise.resolve();
  },
  updateBookingStatus(bookingId, status) {
    const b = this.globalData.bookings.find(x => x.id === bookingId);
    if (b) {
      b.status = status;
      // 完成时发放积分
      if (status === 'completed' && b.totalAmount) {
        this.grantConsumePoints(b.totalAmount);
      }
      wx.setStorageSync('bookings', JSON.stringify(this.globalData.bookings));
    }
    return Promise.resolve();
  },
  saveUserInfo(info) {
    this.globalData.userInfo = info;
    wx.setStorageSync('userInfo', JSON.stringify(info));
  }
});
