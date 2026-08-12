/**
 * 我的预约 — 云开发版
 */

const app = getApp();
const { getBookingStatus } = require('../../utils/util.js');

Page({
  data: {
    statusTabs: [
      { label: '全部', value: 'all', count: 0 },
      { label: '待确认', value: 'pending', count: 0 },
      { label: '已确认', value: 'confirmed', count: 0 },
      { label: '已完成', value: 'completed', count: 0 },
      { label: '已取消', value: 'cancelled', count: 0 }
    ],
    activeStatus: 'all',
    allBookings: [],
    displayList: []
  },

  async onShow() {
    await this.loadBookings();
  },

  async loadBookings() {
    const bookings = app.globalData.bookings || [];
    const enriched = bookings.map(b => ({
      ...b,
      statusInfo: getBookingStatus(b.status)
    }));

    this.setData({ allBookings: enriched });
    this.updateTabsCount();
    this.filterBookings();
  },

  updateTabsCount() {
    const { allBookings, statusTabs } = this.data;
    const updated = statusTabs.map(tab => ({
      ...tab,
      count: tab.value === 'all'
        ? allBookings.length
        : allBookings.filter(b => b.status === tab.value).length
    }));
    this.setData({ statusTabs: updated });
  },

  onStatusTap(e) {
    this.setData({ activeStatus: e.currentTarget.dataset.value });
    this.filterBookings();
  },

  filterBookings() {
    const { allBookings, activeStatus } = this.data;
    const list = activeStatus === 'all'
      ? allBookings
      : allBookings.filter(b => b.status === activeStatus);
    this.setData({ displayList: list });
  },

  async onCancelBooking(e) {
    const { id } = e.currentTarget.dataset;
    const res = await new Promise(resolve => {
      wx.showModal({
        title: '取消预约',
        content: '确定要取消本次预约吗？',
        confirmText: '确定取消',
        cancelText: '再想想',
        confirmColor: '#D4A0A0',
        success: resolve
      });
    });

    if (res.confirm) {
      await app.updateBookingStatus(id, 'cancelled');
      await this.loadBookings();
      wx.showToast({ title: '已取消', icon: 'none' });
    }
  },

  onGoBook() {
    wx.switchTab({ url: '/pages/booking/booking' });
  },

  onShareAppMessage() {
    return { title: '悦指间美甲 — 我的预约', path: '/pages/index/index' };
  }
});
