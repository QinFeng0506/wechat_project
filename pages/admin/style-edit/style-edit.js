/**
 * 款式编辑页 — 新增/编辑美甲款式 + 图片选择上传
 * 通过 ?id=xxx 进入编辑模式；无参数 = 新增
 */
const cloud = require('../../../utils/cloud.js');
const { guardAdmin } = require('../../../utils/guard.js');


const SUB_CATEGORIES = ['纯色', '法式', '猫眼', '渐变', '贴片', '雕花'];

Page({
  data: {
    id: '',
    isEdit: false,
    name: '',
    subCategoryIndex: 0,
    subCategories: SUB_CATEGORIES,
    price: '',
    duration: '',
    description: '',
    isHot: false,
    isNew: true,
    coverImage: '',
    uploading: false
  },

  onLoad(options) {
    if (!guardAdmin()) return;
    // 只记录参数、设置标题；数据加载放到 onReady（首次渲染完成后）
    // 否则开发工具会报「Expected updated data but get first rendering data」
    this.styleId = (options && options.id) || '';
    wx.setNavigationBarTitle({ title: this.styleId ? '编辑款式' : '新增款式' });
  },

  onReady() {
    this.initData();
  },

  async initData() {
    if (!this.styleId) return;
    const style = await cloud.getStyleById(this.styleId);
    if (style) {
      const idx = Math.max(0, SUB_CATEGORIES.indexOf(style.subCategory));
      this.setData({
        id: style.id,
        isEdit: true,
        name: style.name || '',
        subCategoryIndex: idx,
        price: String(style.price || ''),
        duration: String(style.duration || ''),
        description: style.description || '',
        isHot: !!style.isHot,
        isNew: !!style.isNew,
        coverImage: style.coverImage || (style.images && style.images[0]) || ''
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
          this.setData({ coverImage: url, uploading: false });
          wx.showToast({ title: '图片已就绪', icon: 'success' });
        } catch (e) {
          this.setData({ uploading: false });
          wx.showToast({ title: '图片处理失败，请重试', icon: 'none' });
        }
      }
    });
  },

  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPriceInput(e) { this.setData({ price: e.detail.value }); },
  onDurationInput(e) { this.setData({ duration: e.detail.value }); },
  onDescInput(e) { this.setData({ description: e.detail.value }); },
  onPickSubCategory(e) { this.setData({ subCategoryIndex: Number(e.detail.value) }); },
  onToggleHot(e) { this.setData({ isHot: e.detail.value }); },
  onToggleNew(e) { this.setData({ isNew: e.detail.value }); },

  /** 保存（新增/更新通用） */
  async onSave() {
    const d = this.data;
    if (!d.name.trim()) return wx.showToast({ title: '请填写款式名称', icon: 'none' });
    if (!d.coverImage) return wx.showToast({ title: '请选择款式图片', icon: 'none' });
    const price = Number(d.price);
    const duration = Number(d.duration);
    if (!price || price <= 0) return wx.showToast({ title: '请填写正确的价格', icon: 'none' });
    if (!duration || duration <= 0) return wx.showToast({ title: '请填写正确的时长', icon: 'none' });

    wx.showLoading({ title: '保存中...' });
    const style = {
      id: d.id || '',
      name: d.name.trim(),
      category: 'nail',
      subCategory: SUB_CATEGORIES[d.subCategoryIndex],
      price,
      duration,
      description: d.description.trim(),
      isHot: d.isHot,
      isNew: d.isNew,
      coverImage: d.coverImage,
      images: [d.coverImage]
    };
    if (!d.isEdit) {
      style.tags = [];
      style.technicianIds = [];
    }
    await cloud.adminSaveStyle(style);
    wx.hideLoading();
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  onCancel() {
    wx.navigateBack();
  }
});
