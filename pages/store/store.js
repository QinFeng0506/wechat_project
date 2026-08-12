/**
 * 门店信息页 — 云开发版
 */

const cloud = require('../../utils/cloud.js');

Page({
  data: {
    storeInfo: {},
    markers: []
  },

  async onLoad() {
    await this.initPage();
  },

  async initPage() {
    wx.showLoading({ title: '加载中...' });

    let info = null;
    try {
      info = await cloud.getStoreInfo();
    } catch (e) {
      const { storeInfo } = require('../../utils/data.js');
      info = storeInfo;
    }

    const markers = [{
      id: 1,
      latitude: info.latitude,
      longitude: info.longitude,
      title: info.name,
      iconPath: '/images/store/marker.png',
      width: 36,
      height: 36,
      callout: {
        content: info.name,
        color: '#3D3030',
        fontSize: 14,
        borderRadius: 8,
        padding: 8,
        display: 'ALWAYS'
      }
    }];

    this.setData({ storeInfo: info, markers });
    wx.hideLoading();
  },

  onPreviewImage(e) {
    const { index } = e.currentTarget.dataset;
    wx.previewImage({
      current: this.data.storeInfo.images[index],
      urls: this.data.storeInfo.images
    });
  },

  onNavigate() {
    const { latitude, longitude, name, address } = this.data.storeInfo;
    wx.openLocation({ latitude, longitude, name, address, scale: 16 });
  },

  onOpenMap() {
    this.onNavigate();
  },

  onCall() {
    const phone = this.data.storeInfo.phone.replace(/-/g, '');
    wx.makePhoneCall({ phoneNumber: phone });
  },

  onShareAppMessage() {
    return { title: `悦指间美甲 — ${this.data.storeInfo.address}`, path: '/pages/store/store' };
  }
});
