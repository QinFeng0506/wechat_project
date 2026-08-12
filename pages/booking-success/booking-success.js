/**
 * 预约成功页
 */

const app = getApp();

Page({
  data: {
    booking: null
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadBooking(id);
    }
  },

  /**
   * 加载预约记录
   */
  loadBooking(id) {
    const bookings = app.globalData.bookings || [];
    const booking = bookings.find(b => b.id === id);
    this.setData({ booking: booking || null });
  },

  /**
   * 查看我的预约
   */
  onViewBooking() {
    wx.navigateTo({
      url: '/pages/my-bookings/my-bookings'
    });
  },

  /**
   * 返回首页
   */
  onBackHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '我在悦指间美甲预约成功了！',
      path: '/pages/index/index'
    };
  }
});
