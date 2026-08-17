/**
 * 积分商品管理 — 加载、新增、编辑、删除、启用/禁用
 */
const cloud = require('../../../utils/cloud.js');
const { guardAdmin } = require('../../../utils/guard.js');


Page({
  data: {
    goods: []
  },

  async onShow() {
    if (!guardAdmin()) return;
    await this.loadGoods();
  },

  /** 加载商品列表（含已下架的，管理页需要全部显示） */
  async loadGoods() {
    try {
      const goods = await cloud.getPointsGoods({ includeInactive: true });
      this.setData({ goods });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /** 新增商品 — 跳转编辑页 */
  onAdd() {
    wx.navigateTo({ url: '/pages/admin/goods-edit/goods-edit' });
  },

  /** 编辑商品 — 跳转编辑页并带上商品 id */
  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/admin/goods-edit/goods-edit?id=' + id });
  },

  /** 删除商品 — 确认后调用 cloud 并刷新 */
  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该商品吗？',
      confirmText: '确定删除',
      confirmColor: '#E07B7B',
      success: async (res) => {
        if (res.confirm) {
          await cloud.adminDeletePointsGoods(id);
          wx.showToast({ title: '已删除', icon: 'success' });
          await this.loadGoods();
        }
      }
    });
  },

  /** 切换启用/禁用 — 持久化到 cloud */
  async onToggleActive(e) {
    const { id } = e.currentTarget.dataset;
    const checked = e.detail.value;
    await cloud.adminUpdatePointsGoods(id, { isActive: checked });
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
