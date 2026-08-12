/**
 * 款式管理 — 加载、新增、编辑、删除
 */
const cloud = require('../../../utils/cloud.js');

Page({
  data: {
    styles: []
  },

  /** 每次显示时刷新列表 */
  async onShow() {
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

  /** 新增款式 — 提示开发中 */
  onAdd() {
    wx.showToast({ title: '功能开发中', icon: 'none', duration: 1500 });
  },

  /** 编辑款式 — 提示开发中 */
  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({ title: '编辑功能开发中', icon: 'none', duration: 1500 });
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
