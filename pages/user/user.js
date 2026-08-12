/** 个人中心 — 二期扩展（积分+管理后台入口） */
const app = getApp();
const cloud = require('../../utils/cloud.js');

Page({
  data: {
    userInfo: {}, phoneNumber: '', bookingCount: 0, favoriteCount: 0,
    pendingCount: 0, pointsBalance: 0, isAdmin: false
  },

  async onShow() {
    await this.refreshData();
  },

  async refreshData() {
    const g = app.globalData;
    const bookings = g.bookings || [];
    const favorites = g.favorites || [];
    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    this.setData({
      userInfo: g.userInfo || {},
      phoneNumber: g.phoneNumber || '',
      bookingCount: bookings.length,
      favoriteCount: favorites.length,
      pendingCount,
      pointsBalance: g.pointsBalance || 0,
      isAdmin: g.isAdmin || false
    });
  },

  onGetUserInfo() {
    wx.getUserProfile({
      desc: '用于展示用户头像和昵称',
      success: (res) => {
        app.saveUserInfo(res.userInfo);
        this.setData({ userInfo: res.userInfo });
        wx.showToast({ title: '登录成功', icon: 'success' });
        // 新用户赠送积分
        if (app.globalData.pointsBalance === 0) {
          app.globalData.pointsBalance = 50;
          wx.setStorageSync('points_balance', 50);
          app.savePointsRecord('earn', 'first_bind', 50, '新用户注册赠送');
        }
      }
    });
  },

  onTapMyBookings() { wx.navigateTo({ url: '/pages/my-bookings/my-bookings' }); },
  onTapMyFavorites() { wx.navigateTo({ url: '/pages/my-favorites/my-favorites' }); },
  onTapPoints() { wx.navigateTo({ url: '/pages/points/points' }); },
  onTapStore() { wx.navigateTo({ url: '/pages/store/store' }); },
  onTapTechnician() { wx.navigateTo({ url: '/pages/technician/technician' }); },
  onTapAdmin() { wx.navigateTo({ url: '/pages/admin/dashboard/dashboard' }); },

  onTapContact() {
    wx.showModal({
      title: '联系客服', content: '客服电话：138-0000-0000\n营业时间 10:00-21:00',
      confirmText: '拨打', cancelText: '取消', confirmColor: '#D4A0A0',
      success: (res) => { if (res.confirm) wx.makePhoneCall({ phoneNumber: '13800000000' }); }
    });
  },

  onTapAbout() {
    wx.showModal({
      title: '关于悦指间美甲',
      content: '悦指间美甲 — 专注高品质美甲服务\n\n积分签到 · DIY试色 · 在线预约\n\n版本：v2.0.0',
      showCancel: false, confirmText: '知道了', confirmColor: '#D4A0A0'
    });
  },

  onShareAppMessage() {
    return { title: '悦指间美甲 — 发现你的专属美甲风格', path: '/pages/index/index' };
  }
});
