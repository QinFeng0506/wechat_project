/**
 * 技师编辑页 — 新增/编辑技师 + 头像上传 + 每时段可约位置数配置
 * 通过 ?id=xxx 进入编辑模式；无参数 = 新增
 */
const cloud = require('../../../utils/cloud.js');
const { guardAdmin } = require('../../../utils/guard.js');


Page({
  data: {
    id: '',
    isEdit: false,
    name: '',
    title: '',
    experience: '',
    specialties: '',
    slotCount: '3',
    description: '',
    avatar: '',
    isAvailable: true,
    uploading: false
  },

  onLoad(options) {
    if (!guardAdmin()) return;
    // 数据加载放到 onReady（首次渲染完成后），避免渲染层报错
    this.techId = (options && options.id) || '';
    wx.setNavigationBarTitle({ title: this.techId ? '编辑技师' : '新增技师' });
  },

  onReady() {
    this.initData();
  },

  async initData() {
    if (!this.techId) return;
    const techs = await cloud.getTechnicians();
    const tech = techs.find(t => t.id === this.techId);
    if (tech) {
      this.setData({
        id: tech.id,
        isEdit: true,
        name: tech.name || '',
        title: tech.title || '',
        experience: String(tech.experience || ''),
        specialties: (tech.specialties || []).join('，'),
        slotCount: String(tech.slotCount || 3),
        description: tech.description || '',
        avatar: tech.avatar || '',
        isAvailable: tech.isAvailable !== false
      });
    }
  },

  /** 从手机相册选头像 → 压缩上传 */
  onChooseAvatar() {
    if (this.data.uploading) return;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: async (res) => {
        const file = res.tempFiles[0];
        this.setData({ uploading: true });
        try {
          const url = await cloud.adminUploadImage(file.tempFilePath);
          this.setData({ avatar: url, uploading: false });
          wx.showToast({ title: '头像已就绪', icon: 'success' });
        } catch (e) {
          this.setData({ uploading: false });
          wx.showToast({ title: '图片处理失败，请重试', icon: 'none' });
        }
      }
    });
  },

  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onTitleInput(e) { this.setData({ title: e.detail.value }); },
  onExpInput(e) { this.setData({ experience: e.detail.value }); },
  onSpecInput(e) { this.setData({ specialties: e.detail.value }); },
  onSlotInput(e) { this.setData({ slotCount: e.detail.value }); },
  onDescInput(e) { this.setData({ description: e.detail.value }); },
  onToggleAvailable(e) { this.setData({ isAvailable: e.detail.value }); },

  /** 保存（新增/更新通用） */
  async onSave() {
    const d = this.data;
    if (!d.name.trim()) return wx.showToast({ title: '请填写技师姓名', icon: 'none' });
    if (!d.avatar) return wx.showToast({ title: '请选择技师头像', icon: 'none' });
    const experience = Number(d.experience);
    const slotCount = parseInt(d.slotCount, 10);
    if (isNaN(experience) || experience < 0) return wx.showToast({ title: '请填写正确的从业年限', icon: 'none' });
    if (!slotCount || slotCount < 1 || slotCount > 20) return wx.showToast({ title: '每时段可约位置填 1~20', icon: 'none' });

    wx.showLoading({ title: '保存中...' });
    // 特长按逗号拆分（支持中文逗号）
    const specialties = d.specialties
      .split(/[，,、]/)
      .map(s => s.trim())
      .filter(s => s);
    const tech = {
      id: d.id || '',
      name: d.name.trim(),
      title: d.title.trim() || '美甲师',
      experience,
      specialties,
      slotCount,
      description: d.description.trim(),
      avatar: d.avatar,
      isAvailable: d.isAvailable
    };
    await cloud.adminSaveTechnician(tech);
    wx.hideLoading();
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  onCancel() {
    wx.navigateBack();
  }
});
