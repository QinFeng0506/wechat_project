/**
 * 预约管理 — 全部预约、状态筛选、操作确认
 */
const cloud = require('../../../utils/cloud.js');
const { getBookingStatus } = require('../../../utils/util.js');

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

  /** 加载全部预约 */
  async loadBookings() {
    try {
      const bookings = await cloud.adminGetAllBookings();
      const enriched = bookings.map(b => ({
        ...b,
        statusInfo: getBookingStatus(b.status)
      }));
      this.setData({ allBookings: enriched });
      this.updateTabsCount();
      this.filterBookings();
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /** 更新各 Tab 计数 */
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

  /** 切换 Tab */
  onStatusTap(e) {
    this.setData({ activeStatus: e.currentTarget.dataset.value });
    this.filterBookings();
  },

  /** 按状态过滤 */
  filterBookings() {
    const { allBookings, activeStatus } = this.data;
    const list = activeStatus === 'all'
      ? allBookings
      : allBookings.filter(b => b.status === activeStatus);
    this.setData({ displayList: list });
  },

  /** 确认预约 → confirmed */
  async onConfirm(e) {
    const { id } = e.currentTarget.dataset;
    const res = await wx.showModal({
      title: '确认预约',
      content: '确认接受该预约吗？',
      confirmText: '确认',
      confirmColor: '#D4A0A0'
    });
    if (res.confirm) {
      await cloud.adminUpdateBookingStatus(id, 'confirmed');
      wx.showToast({ title: '已确认', icon: 'success' });
      await this.loadBookings();
    }
  },

  /** 完成预约 → completed */
  async onComplete(e) {
    const { id } = e.currentTarget.dataset;
    const res = await wx.showModal({
      title: '完成预约',
      content: '确认该预约已服务完成？',
      confirmText: '完成',
      confirmColor: '#7EBF8E'
    });
    if (res.confirm) {
      await cloud.adminUpdateBookingStatus(id, 'completed');
      wx.showToast({ title: '已完成', icon: 'success' });
      await this.loadBookings();
    }
  },

  /** 取消预约 → cancelled */
  async onCancel(e) {
    const { id } = e.currentTarget.dataset;
    const res = await wx.showModal({
      title: '取消预约',
      content: '确定要取消该预约吗？',
      confirmText: '确定取消',
      confirmColor: '#E07B7B'
    });
    if (res.confirm) {
      await cloud.adminUpdateBookingStatus(id, 'cancelled');
      wx.showToast({ title: '已取消', icon: 'success' });
      await this.loadBookings();
    }
  }
});
