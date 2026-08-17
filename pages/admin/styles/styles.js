/**
 * 款式管理 — 加载、新增、编辑、删除
 */
const cloud = require('../../../utils/cloud.js');
const { guardAdmin } = require('../../../utils/guard.js');


Page({
  data: {
    styles: []
  },

  /** 每次显示时刷新列表 */
  async onShow() {
    if (!guardAdmin()) return;
    await this.loadStyles();
  },

  /** 加载款式列表 */
  async loadStyles() {
    try {
      const styles = await cloud.getStyles();
      this.setData({ styles });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /** 新增款式 — 跳转编辑页 */
  onAdd() {
    wx.navigateTo({ url: '/pages/admin/style-edit/style-edit' });
  },

  /** 编辑款式 — 跳转编辑页并带上款式 id */
  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/admin/style-edit/style-edit?id=' + id });
  },

  /** 删除款式 — 确认后调用 cloud */
  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除该款式吗？',
      confirmText: '确定删除',
      confirmColor: '#E07B7B',
      success: async (res) => {
        if (res.confirm) {
          await cloud.adminDeleteStyle(id);
          wx.showToast({ title: '已删除', icon: 'success' });
          await this.loadStyles();
        }
      }
    });
  }
});
