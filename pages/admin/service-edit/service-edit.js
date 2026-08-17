/**
 * 服务项目编辑页 — 新增/编辑美甲服务项目
 * 通过 ?id=xxx 进入编辑模式；无参数 = 新增
 */
const cloud = require('../../../utils/cloud.js');
const { guardAdmin } = require('../../../utils/guard.js');


Page({
  data: {
    id: '',
    isEdit: false,
    name: '',
    price: '',
    duration: '',
    desc: ''
  },

  onLoad(options) {
    if (!guardAdmin()) return;
    // 数据加载放到 onReady（首次渲染完成后），避免渲染层报错
    this.itemId = (options && options.id) || '';
    wx.setNavigationBarTitle({ title: this.itemId ? '编辑服务项目' : '新增服务项目' });
  },

  onReady() {
    this.initData();
  },

  async initData() {
    if (!this.itemId) return;
    const categories = await cloud.getServiceCategories();
    let item = null;
    categories.some(cat => {
      item = cat.items.find(i => i.id === this.itemId);
      return !!item;
    });
    if (item) {
      this.setData({
        id: item.id,
        isEdit: true,
        name: item.name || '',
        price: String(item.price || ''),
        duration: String(item.duration || ''),
        desc: item.desc || ''
      });
    }
  },

  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPriceInput(e) { this.setData({ price: e.detail.value }); },
  onDurationInput(e) { this.setData({ duration: e.detail.value }); },
  onDescInput(e) { this.setData({ desc: e.detail.value }); },

  /** 保存（新增/更新通用） */
  async onSave() {
    const d = this.data;
    if (!d.name.trim()) return wx.showToast({ title: '请填写项目名称', icon: 'none' });
    const price = Number(d.price);
    const duration = Number(d.duration);
    if (!price || price <= 0) return wx.showToast({ title: '请填写正确的价格', icon: 'none' });
    if (!duration || duration <= 0) return wx.showToast({ title: '请填写正确的时长', icon: 'none' });

    wx.showLoading({ title: '保存中...' });
    const item = {
      id: d.id || '',
      name: d.name.trim(),
      price,
      duration,
      desc: d.desc.trim()
    };
    await cloud.adminSaveService(item);
    wx.hideLoading();
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  onCancel() {
    wx.navigateBack();
  }
});
