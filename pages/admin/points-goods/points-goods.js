/**
 * 积分商品管理 — 加载、新增、编辑、删除、启用/禁用
 */
const cloud = require('../../../utils/cloud.js');

Page({
  data: {
    goods: []
  },

  async onShow() {
    await this.loadGoods();
  },

  /** 加载商品列表 */
  async loadGoods() {
    try {
      const goods = await cloud.getPointsGoods();
      this.setData({ goods });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /** 新增商品 */
  onAdd() {
    wx.showToast({ title: '新增功能开发中', icon: 'none', duration: 1500 });
  },

  /** 编辑商品 */
  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({ title: '编辑功能开发中', icon: 'none', duration: 1500 });
  },

  /** 删除商品 */
  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该商品吗？',
      confirmText: '确定删除',
      confirmColor: '#E07B7B',
      success: (res) => {
        if (res.confirm) {
          // 本地移除
          const goods = this.data.goods.filter(g => g._id !== id);
          this.setData({ goods });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  /** 切换启用/禁用 */
  onToggleActive(e) {
    const { id } = e.currentTarget.dataset;
    const checked = e.detail.value;
    const goods = this.data.goods.map(g => {
      if (g._id === id) {
        return { ...g, isActive: checked };
      }
      return g;
    });
    this.setData({ goods });
    wx.showToast({
      title: checked ? '已启用' : '已禁用',
      icon: 'none',
      duration: 1200
    });
  }
});
