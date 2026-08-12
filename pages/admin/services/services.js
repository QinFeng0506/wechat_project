/**
 * 项目管理 — 加载分类及子项目、CRUD 操作（模拟）
 */
const cloud = require('../../../utils/cloud.js');

Page({
  data: {
    categories: []
  },

  async onShow() {
    await this.loadCategories();
  },

  /** 加载服务分类及项目 */
  async loadCategories() {
    try {
      const categories = await cloud.getServiceCategories();
      this.setData({ categories });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /** 新增项目 */
  onAdd() {
    wx.showToast({ title: '新增功能开发中', icon: 'none', duration: 1500 });
  },

  /** 编辑项目 */
  onEdit(e) {
    const { id, catId } = e.currentTarget.dataset;
    wx.showToast({ title: '编辑功能开发中', icon: 'none', duration: 1500 });
  },

  /** 删除项目 */
  onDelete(e) {
    const { id, catId } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该项目吗？',
      confirmText: '确定删除',
      confirmColor: '#E07B7B',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '已删除', icon: 'success' });
          // 本地模式下从 data 中移除该项
          const categories = this.data.categories.map(cat => ({
            ...cat,
            items: cat.items.filter(item => item.id !== id)
          }));
          this.setData({ categories });
        }
      }
    });
  }
});
