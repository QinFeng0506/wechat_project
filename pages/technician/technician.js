/**
 * 技师介绍页 — 云开发版
 */

const cloud = require('../../utils/cloud.js');

Page({
  data: {
    technicians: [],
    selectedId: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ selectedId: options.id });
    }
  },

  /** 每次显示都刷新（管理后台换头像/改信息后返回即可见） */
  async onShow() {
    wx.showLoading({ title: '加载中...' });

    try {
      const techs = await cloud.getTechnicians();
      this.setData({ technicians: techs });
    } catch (e) {
      const { technicians: localTechs } = require('../../utils/data.js');
      this.setData({ technicians: localTechs });
    }

    wx.hideLoading();
  },

  onToggleDetail(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      selectedId: this.data.selectedId === id ? '' : id
    });
  },

  onBookThisTech(e) {
    wx.switchTab({ url: '/pages/booking/booking' });
  },

  onShareAppMessage() {
    return { title: '悦指间美甲 — 专业技师团队', path: '/pages/technician/technician' };
  }
});
