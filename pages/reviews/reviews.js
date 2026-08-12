/**
 * 用户评价列表页
 * ?styleId  筛选指定款式的评价；不传则显示全部
 */

const cloud = require('../../utils/cloud.js');

Page({
  data: {
    reviews: [],
    styleId: ''
  },

  onLoad(options) {
    this._styleId = options.styleId || '';
  },

  async onShow() {
    wx.showLoading({ title: '加载中...' });
    try {
      let list = await cloud.getReviews(this._styleId || undefined);
      list = list.map(r => ({
        ...r,
        starsDisplay: '⭐'.repeat(r.stars || 5),
        createTime: this._fmt(r.createTime)
      }));
      this.setData({ reviews: list, styleId: this._styleId });
    } catch (e) {
      this.setData({ reviews: [] });
    }
    wx.hideLoading();
  },

  _fmt(t) {
    if (!t) return '';
    const d = new Date(t);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  onPreviewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    wx.previewImage({ current, urls });
  }
});
