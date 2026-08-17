/**
 * 技师管理 — 列表、新增、编辑、删除、每时段可约位置数配置
 */
const cloud = require('../../../utils/cloud.js');
const { guardAdmin } = require('../../../utils/guard.js');


Page({
  data: {
    technicians: []
  },

  async onShow() {
    if (!guardAdmin()) return;
    await this.loadTechs();
  },

  /** 加载技师列表 */
  async loadTechs() {
    try {
      const technicians = await cloud.getTechnicians();
      this.setData({ technicians });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /** 新增技师 — 跳转编辑页 */
  onAdd() {
    wx.navigateTo({ url: '/pages/admin/technician-edit/technician-edit' });
  },

  /** 编辑技师 — 跳转编辑页并带上技师 id */
  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/admin/technician-edit/technician-edit?id=' + id });
  },

  /** 删除技师 — 确认后调用 cloud 并刷新 */
  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该技师吗？',
      confirmText: '确定删除',
      confirmColor: '#E07B7B',
      success: async (res) => {
        if (res.confirm) {
          await cloud.adminDeleteTechnician(id);
          wx.showToast({ title: '已删除', icon: 'success' });
          await this.loadTechs();
        }
      }
    });
  }
});
