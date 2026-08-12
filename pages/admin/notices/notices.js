/**
 * 公告管理 — 加载、发布、编辑、删除公告
 * 新增/编辑使用 wx.showModal 内联表单（content 设置 editable:true）
 */
const cloud = require('../../../utils/cloud.js');

Page({
  data: {
    notices: []
  },

  async onShow() {
    await this.loadNotices();
  },

  /** 加载公告列表 */
  async loadNotices() {
    try {
      const notices = await cloud.getNotices();
      this.setData({ notices });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /** 发布新公告 — 弹出输入框 */
  onAdd() {
    // 分两步：先输入标题，再输入内容
    wx.showModal({
      title: '发布公告',
      content: '请输入公告标题与内容',
      editable: true,
      placeholderText: '输入公告标题',
      confirmText: '下一步',
      confirmColor: '#D4A0A0',
      success: (res) => {
        if (!res.confirm || !res.content) return;
        const title = res.content;
        // 再输入正文
        wx.showModal({
          title: '公告内容',
          content: '请输入公告正文内容',
          editable: true,
          placeholderText: '输入公告正文...',
          confirmText: '发布',
          confirmColor: '#D4A0A0',
          success: (res2) => {
            if (res2.confirm && res2.content) {
              const newNotice = {
                _id: 'nt_' + Date.now(),
                title: title,
                content: res2.content,
                type: 'notice',
                isTop: false,
                isActive: true,
                createTime: new Date().toISOString().slice(0, 10)
              };
              // 追加到列表头部
              const notices = [newNotice, ...this.data.notices];
              this.setData({ notices });
              wx.showToast({ title: '发布成功', icon: 'success' });
            }
          }
        });
      }
    });
  },

  /** 编辑公告 */
  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    const notice = this.data.notices.find(n => n._id === id);
    if (!notice) return;

    wx.showModal({
      title: '编辑公告',
      content: notice.content,
      editable: true,
      placeholderText: '修改公告内容...',
      confirmText: '保存',
      confirmColor: '#D4A0A0',
      success: (res) => {
        if (res.confirm && res.content) {
          const notices = this.data.notices.map(n => {
            if (n._id === id) return { ...n, content: res.content };
            return n;
          });
          this.setData({ notices });
          wx.showToast({ title: '已保存', icon: 'success' });
        }
      }
    });
  },

  /** 删除公告 */
  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该公告吗？',
      confirmText: '确定删除',
      confirmColor: '#E07B7B',
      success: (res) => {
        if (res.confirm) {
          const notices = this.data.notices.filter(n => n._id !== id);
          this.setData({ notices });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});
