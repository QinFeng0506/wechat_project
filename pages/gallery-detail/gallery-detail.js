/**
 * 款式详情页 — 云开发版
 */

const app = getApp();
const cloud = require('../../utils/cloud.js');

Page({
  data: {
    style: null,
    categoryName: '',
    isFavorited: false,
    relatedTechnicians: [],
    reviews: []
  },

  async onLoad(options) {
    const { id } = options;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    await this.loadStyle(id);
  },

  onShow() {
    if (this.data.style) {
      this.setData({ isFavorited: app.isFavorite(this.data.style.id) });
    }
  },

  async loadStyle(id) {
    wx.showLoading({ title: '加载中...' });

    let style = null;
    let technicians = [];

    try {
      style = await cloud.getStyleById(id);
    } catch (e) {
      const { nailStyles } = require('../../utils/data.js');
      style = nailStyles.find(s => s.id === id);
    }

    if (!style) {
      wx.hideLoading();
      wx.showToast({ title: '款式未找到', icon: 'none' });
      return;
    }

    // 获取关联技师
    try {
      const allTechs = await cloud.getTechnicians();
      technicians = allTechs.filter(t => style.technicianIds.includes(t.id));
    } catch (e) {
      const { technicians: localTechs } = require('../../utils/data.js');
      technicians = localTechs.filter(t => style.technicianIds.includes(t.id));
    }

    const categoryMap = { 'nail': '美甲' };

    this.setData({
      style,
      categoryName: categoryMap[style.category] || '美甲',
      isFavorited: app.isFavorite(id),
      relatedTechnicians: technicians
    });

    // 异步加载评价
    this.loadReviews(id);

    wx.hideLoading();
  },

  onPreviewImage(e) {
    const { index } = e.currentTarget.dataset;
    wx.previewImage({
      current: this.data.style.images[index],
      urls: this.data.style.images
    });
  },

  async onToggleFavorite() {
    const isFavorited = await app.toggleFavorite(this.data.style.id);
    this.setData({ isFavorited });
    wx.showToast({ title: isFavorited ? '已收藏' : '已取消收藏', icon: 'none', duration: 1000 });
  },

  onBookNow() {
    const { style } = this.data;
    app.globalData.cartItems = [{
      id: style.id, name: style.name,
      price: style.price, duration: style.duration,
      coverImage: style.coverImage
    }];
    wx.switchTab({ url: '/pages/booking/booking' });
  },

  async loadReviews(styleId) {
    try {
      let list = await cloud.getReviews(styleId);
      list = list.slice(0, 3).map(r => ({
        ...r,
        starsDisplay: '⭐'.repeat(r.stars || 5)
      }));
      this.setData({ reviews: list });
    } catch (e) {
      this.setData({ reviews: [] });
    }
  },

  onViewAllReviews() {
    const { style } = this.data;
    wx.navigateTo({ url: `/pages/reviews/reviews?styleId=${style.id}` });
  },

  onTechnicianTap(e) {
    wx.navigateTo({ url: `/pages/technician/technician?id=${e.currentTarget.dataset.id}` });
  },

  onShareAppMessage() {
    const { style } = this.data;
    return {
      title: `${style.name} — 悦指间美甲`,
      path: `/pages/gallery-detail/gallery-detail?id=${style.id}`,
      imageUrl: style.coverImage
    };
  }
});
