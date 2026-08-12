/**
 * 管理后台首页 — Dashboard
 * 功能卡片网格，导航到各管理页面
 */
Page({
  data: {
    menuItems: [
      { id: 'styles',   name: '款式管理', icon: '📸', url: '/pages/admin/styles/styles' },
      { id: 'services', name: '项目管理', icon: '📋', url: '/pages/admin/services/services' },
      { id: 'bookings', name: '预约管理', icon: '📅', url: '/pages/admin/bookings/bookings' },
      { id: 'goods',    name: '积分商品', icon: '🎁', url: '/pages/admin/points-goods/points-goods' },
      { id: 'notices',  name: '公告管理', icon: '📢', url: '/pages/admin/notices/notices' },
      { id: 'home',     name: '返回首页', icon: '🏠', url: '' }
    ]
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
  }
});
