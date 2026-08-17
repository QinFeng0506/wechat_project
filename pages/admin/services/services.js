/**
 * 项目管理 — 加载分类及子项目、CRUD 操作（模拟）
 */
const cloud = require('../../../utils/cloud.js');
const { guardAdmin } = require('../../../utils/guard.js');


Page({
  data: {
    categories: []
  },

  async onShow() {
    if (!guardAdmin()) return;
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

  /** 新增项目 — 跳转编辑页 */
  onAdd() {
    wx.navigateTo({ url: '/pages/admin/service-edit/service-edit' });
  },

  /** 编辑项目 — 跳转编辑页并带上项目 id */
  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/admin/service-edit/service-edit?id=' + id });
  },

  /** 删除项目 — 确认后调用 cloud 并刷新 */
  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该项目吗？',
      confirmText: '确定删除',
      confirmColor: '#E07B7B',
      success: async (res) => {
        if (res.confirm) {
          await cloud.adminDeleteService(id);
          wx.showToast({ title: '已删除', icon: 'success' });
          await this.loadCategories();
        }
      }
    });
  }
});
