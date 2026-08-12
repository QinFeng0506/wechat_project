/**
 * 收藏款式 — 云开发版
 */

const app = getApp();
const cloud = require('../../utils/cloud.js');

Page({
  data: {
    favoriteList: [],
    leftList: [],
    rightList: []
  },

  async onShow() {
    await this.loadFavorites();
  },

  async loadFavorites() {
    const favIds = app.globalData.favorites || [];
    if (favIds.length === 0) {
      this.setData({ favoriteList: [], leftList: [], rightList: [] });
      return;
    }

    // 从云数据库获取款式信息
    let allStyles = [];
    try {
      allStyles = await cloud.getStyles();
    } catch (e) {
      const { nailStyles } = require('../../utils/data.js');
      allStyles = nailStyles;
    }

    const favoriteList = allStyles
      .filter(style => favIds.includes(style.id))
      .map(style => ({
        id: style.id,
        name: style.name,
        coverImage: style.coverImage,
        price: style.price,
        category: style.category
      }));

    this.setData({ favoriteList });
    this.distributeToGrid(favoriteList);
  },

  distributeToGrid(list) {
    const leftList = [];
    const rightList = [];
    list.forEach((item, index) => {
      if (index % 2 === 0) leftList.push(item);
      else rightList.push(item);
    });
    this.setData({ leftList, rightList });
  },

  async onRemoveFavorite(e) {
    const { id } = e.currentTarget.dataset;
    const res = await new Promise(resolve => {
      wx.showModal({
        title: '取消收藏',
        content: '确定要取消收藏吗？',
        confirmText: '确定', cancelText: '取消',
        confirmColor: '#D4A0A0',
        success: resolve
      });
    });

    if (res.confirm) {
      await app.toggleFavorite(id);
      await this.loadFavorites();
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    }
  },

  onTapStyle(e) {
    wx.navigateTo({ url: `/pages/gallery-detail/gallery-detail?id=${e.currentTarget.dataset.id}` });
  },

  onGoGallery() {
    wx.switchTab({ url: '/pages/gallery/gallery' });
  },

  onShareAppMessage() {
    return { title: '悦指间美甲 — 我的心愿单', path: '/pages/index/index' };
  }
});
