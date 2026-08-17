/**
 * 积分商品编辑页 — 新增/编辑积分商城商品 + 图片选择上传
 * 通过 ?id=xxx 进入编辑模式；无参数 = 新增
 */
const cloud = require('../../../utils/cloud.js');
const { guardAdmin } = require('../../../utils/guard.js');


const GOODS_TYPES = [
  { value: 'service', label: '服务体验' },
  { value: 'voucher', label: '代金券' },
  { value: 'gift', label: '实物礼品' }
];

Page({
  data: {
    id: '',
    isEdit: false,
    name: '',
    typeIndex: 0,
    typeLabels: GOODS_TYPES.map(t => t.label),
    points: '',
    originalPrice: '',
    stock: '',
    description: '',
    image: '',
    uploading: false
  },

  onLoad(options) {
    if (!guardAdmin()) return;
    // 数据加载放到 onReady（首次渲染完成后），避免渲染层报错
    this.goodsId = (options && options.id) || '';
    wx.setNavigationBarTitle({ title: this.goodsId ? '编辑积分商品' : '新增积分商品' });
  },

  onReady() {
    this.initData();
  },

  async initData() {
    if (!this.goodsId) return;
    const goodsList = await cloud.getPointsGoods({ includeInactive: true });
    const goods = goodsList.find(g => g._id === this.goodsId);
    if (goods) {
      const idx = Math.max(0, GOODS_TYPES.findIndex(t => t.value === goods.type));
      this.setData({
        id: goods._id,
        isEdit: true,
        name: goods.name || '',
        typeIndex: idx,
        points: String(goods.points || ''),
        originalPrice: String(goods.originalPrice || ''),
        stock: goods.stock === -1 ? '' : String(goods.stock),
        description: goods.description || '',
        image: goods.image || ''
      });
    }
  },

  /** 从手机相册选图 → 压缩上传 */
  onChooseImage() {
    if (this.data.uploading) return;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: async (res) => {
        const file = res.tempFiles[0];
        this.setData({ uploading: true });
        try {
          const url = await cloud.adminUploadImage(file.tempFilePath);
          this.setData({ image: url, uploading: false });
          wx.showToast({ title: '图片已就绪', icon: 'success' });
        } catch (e) {
          this.setData({ uploading: false });
          wx.showToast({ title: '图片处理失败，请重试', icon: 'none' });
        }
      }
    });
  },

  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPointsInput(e) { this.setData({ points: e.detail.value }); },
  onPriceInput(e) { this.setData({ originalPrice: e.detail.value }); },
  onStockInput(e) { this.setData({ stock: e.detail.value }); },
  onDescInput(e) { this.setData({ description: e.detail.value }); },
  onPickType(e) { this.setData({ typeIndex: Number(e.detail.value) }); },

  /** 保存（新增/更新通用） */
  async onSave() {
    const d = this.data;
    if (!d.name.trim()) return wx.showToast({ title: '请填写商品名称', icon: 'none' });
    if (!d.image) return wx.showToast({ title: '请选择商品图片', icon: 'none' });
    const points = Number(d.points);
    if (!points || points <= 0) return wx.showToast({ title: '请填写正确的所需积分', icon: 'none' });

    wx.showLoading({ title: '保存中...' });
    // stock 留空 = 不限量（-1）
    const stockInput = d.stock.trim();
    const goods = {
      _id: d.id || '',
      name: d.name.trim(),
      type: GOODS_TYPES[d.typeIndex].value,
      points,
      originalPrice: Number(d.originalPrice) || 0,
      stock: stockInput === '' ? -1 : Math.max(0, parseInt(stockInput, 10)),
      description: d.description.trim(),
      image: d.image
    };
    await cloud.adminSavePointsGoods(goods);
    wx.hideLoading();
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  onCancel() {
    wx.navigateBack();
  }
});
