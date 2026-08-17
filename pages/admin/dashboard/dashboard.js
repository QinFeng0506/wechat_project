/**
 * 管理后台首页 — Dashboard
 * 功能卡片网格，导航到各管理页面
 */
const app = getApp();
const { guardAdmin } = require('../../../utils/guard.js');


Page({
  data: {
    menuItems: [
      { id: 'styles',   name: '款式管理', icon: '📸', url: '/pages/admin/styles/styles' },
      { id: 'services', name: '项目管理', icon: '📋', url: '/pages/admin/services/services' },
      { id: 'bookings', name: '预约管理', icon: '📅', url: '/pages/admin/bookings/bookings' },
      { id: 'techs',    name: '技师管理', icon: '👩‍🎨', url: '/pages/admin/technicians/technicians' },
      { id: 'goods',    name: '积分商品', icon: '🎁', url: '/pages/admin/points-goods/points-goods' },
      { id: 'notices',  name: '公告管理', icon: '📢', url: '/pages/admin/notices/notices' },
      { id: 'home',     name: '返回首页', icon: '🏠', url: '' }
    ]
  },

  /** 每次显示先查门禁（锁定后台后重新进入需输密码） */
  onShow() {
    if (!guardAdmin()) return;
  },

  /** 点击卡片导航 */
  onNavTap(e) {
    const { url } = e.currentTarget.dataset;
    if (!url) {
      // 返回首页 — 使用 switchTab
      wx.switchTab({ url: '/pages/index/index' });
      return;
    }
    wx.navigateTo({ url });
  },

  /** 锁定后台 — 退出后需重新输管理员密码才能进入 */
  onLock() {
    app.globalData.isAdmin = false;
    wx.showToast({ title: '后台已锁定', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 500);
  }
});
