/** 个人中心 — 二期扩展（积分+管理后台入口） */
const app = getApp();
const cloud = require('../../utils/cloud.js');

/**
 * 管理员密码存储说明（安全设计）：
 * 密码不在代码包里（避免解包泄露），而是店主首次使用时自己设置、
 * 保存在本机。上线开通云开发后，将换成微信身份自动识别（openid 白名单）。
 */
const PWD_STORAGE_KEY = 'admin_password';

Page({
  data: {
    userInfo: {}, phoneNumber: '', bookingCount: 0, favoriteCount: 0,
    pendingCount: 0, pointsBalance: 0, isAdmin: false,
    loginLoading: false  // 防重复点击
  },

  async onShow() {
    await this.refreshData();
  },

  async refreshData() {
    const g = app.globalData;
    const bookings = g.bookings || [];
    const favorites = g.favorites || [];
    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    this.setData({
      userInfo: g.userInfo || {},
      phoneNumber: g.phoneNumber || '',
      bookingCount: bookings.length,
      favoriteCount: favorites.length,
      pendingCount,
      pointsBalance: g.pointsBalance || 0,
      isAdmin: g.isAdmin || false
    });
  },

  /** 点击登录入口 — 弹出登录方式选择 */
  onGetUserInfo() {
    // 已登录则不再重复弹
    if (this.data.userInfo && this.data.userInfo.nickName) return;
    wx.showActionSheet({
      itemList: ['微信授权登录（推荐）', '手机号注册登录（即将上线）'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.doWechatLogin();
        } else if (res.tapIndex === 1) {
          wx.showModal({
            title: '手机号登录',
            content: '该功能需完成微信认证（个体户 ¥30/年）并开通云开发后可用。当前请先使用微信授权登录，敬请期待！',
            showCancel: false, confirmText: '知道了', confirmColor: '#D4A0A0'
          });
        }
      }
    });
  },

  /** 微信授权登录 — 真机会弹出微信官方授权界面 */
  doWechatLogin() {
    // 防止重复点击
    if (this.data.loginLoading) return;
    this.setData({ loginLoading: true });

    wx.getUserProfile({
      desc: '用于展示用户头像和昵称',
      success: (res) => {
        app.saveUserInfo(res.userInfo);
        this.setData({ userInfo: res.userInfo, loginLoading: false });
        wx.showToast({ title: '登录成功', icon: 'success' });
        // 新用户赠送积分
        if (app.globalData.pointsBalance === 0) {
          app.globalData.pointsBalance = 50;
          wx.setStorageSync('points_balance', 50);
          app.savePointsRecord('earn', 'first_bind', 50, '新用户注册赠送');
          this.setData({ pointsBalance: 50 });
        }
      },
      fail: (err) => {
        this.setData({ loginLoading: false });
        // "too frequently" 错误 → 提示稍后再试
        if (err.errMsg && err.errMsg.includes('frequently')) {
          wx.showToast({ title: '操作太频繁，请稍后再试', icon: 'none' });
        }
        // 其他错误静默处理（用户取消授权等）
      }
    });
  },

  onTapMyBookings() { wx.navigateTo({ url: '/pages/my-bookings/my-bookings' }); },
  onTapMyFavorites() { wx.navigateTo({ url: '/pages/my-favorites/my-favorites' }); },
  onTapPoints() { wx.navigateTo({ url: '/pages/points/points' }); },
  onTapStore() { wx.navigateTo({ url: '/pages/store/store' }); },
  onTapTechnician() { wx.navigateTo({ url: '/pages/technician/technician' }); },
  /** 管理后台入口 — 已解锁直接进；未设密码先设置；否则输密码进入 */
  onTapAdmin() {
    if (app.globalData.isAdmin) {
      wx.navigateTo({ url: '/pages/admin/dashboard/dashboard' });
      return;
    }
    // 密码连错 3 次后锁定 1 分钟
    const now = Date.now();
    if (now < (this._lockUntil || 0)) {
      wx.showToast({ title: '尝试次数过多，请1分钟后再试', icon: 'none' });
      return;
    }

    const savedPwd = wx.getStorageSync(PWD_STORAGE_KEY);
    if (!savedPwd) {
      // 首次使用：店主自己设置密码（4~8 位数字），不写进代码包
      wx.showModal({
        title: '设置管理员密码',
        content: '首次使用请设置管理员密码（4~8 位数字），仅保存在本机',
        editable: true,
        placeholderText: '请输入 4~8 位数字',
        confirmText: '设置',
        cancelText: '取消',
        confirmColor: '#D4A0A0',
        success: (res) => {
          if (!res.confirm) return;
          const pwd = (res.content || '').trim();
          if (!/^\d{4,8}$/.test(pwd)) {
            wx.showToast({ title: '密码需为 4~8 位数字', icon: 'none' });
            return;
          }
          wx.setStorageSync(PWD_STORAGE_KEY, pwd);
          wx.showToast({ title: '密码已设置，请再次点击进入', icon: 'none' });
        }
      });
      return;
    }

    wx.showModal({
      title: '管理员登录',
      content: '',
      editable: true,
      placeholderText: '请输入管理员密码',
      confirmText: '进入',
      cancelText: '取消',
      confirmColor: '#D4A0A0',
      success: (res) => {
        if (!res.confirm) return;
        if (res.content === savedPwd) {
          // 会话内免密：只存内存不落盘，小程序关闭后再打开需重新输密码
          this._wrongCount = 0;
          app.globalData.isAdmin = true;
          this.setData({ isAdmin: true });
          wx.showToast({ title: '欢迎回来，店长！', icon: 'none' });
          setTimeout(() => wx.navigateTo({ url: '/pages/admin/dashboard/dashboard' }), 500);
        } else {
          this._wrongCount = (this._wrongCount || 0) + 1;
          if (this._wrongCount >= 3) {
            this._lockUntil = Date.now() + 60 * 1000;
            this._wrongCount = 0;
            wx.showToast({ title: '错误次数过多，锁定1分钟', icon: 'none' });
          } else {
            wx.showToast({ title: '密码错误，还可尝试' + (3 - this._wrongCount) + '次', icon: 'none' });
          }
        }
      }
    });
  },

  /** 退出登录 — 清除本机保存的头像昵称，同时锁定管理后台 */
  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后将清除本机保存的头像昵称，管理后台也会锁定。确定退出吗？',
      confirmText: '退出',
      confirmColor: '#D4A0A0',
      success: (res) => {
        if (!res.confirm) return;
        app.globalData.userInfo = null;
        app.globalData.phoneNumber = '';
        wx.removeStorageSync('userInfo');
        // 顺手把管理后台也锁上，重新进入需输密码
        app.globalData.isAdmin = false;
        wx.removeStorageSync('is_admin');
        this.setData({ userInfo: {}, phoneNumber: '', isAdmin: false });
        wx.showToast({ title: '已退出登录', icon: 'success' });
      }
    });
  },

  onTapContact() {
    wx.showModal({
      title: '联系客服', content: '客服电话：138-0000-0000\n营业时间 10:00-21:00',
      confirmText: '拨打', cancelText: '取消', confirmColor: '#D4A0A0',
      success: (res) => { if (res.confirm) wx.makePhoneCall({ phoneNumber: '13800000000' }); }
    });
  },

  onTapAbout() {
    wx.showModal({
      title: '关于悦指间美甲',
      content: '本小程序是开发者个人制作的普通项目，记录和展示一个「美甲店小程序」从 0 到 1 的制作过程，包含界面设计、交互逻辑、数据管理等开发细节与思路。\n\n特别声明：本项目仅作技术学习与个人展示用途，不进行任何营销推广，不提供线上销售或交易服务，无任何商业行为。小程序内的店铺信息、服务价格、积分兑换等均为模拟演示数据。\n\n版本：v1.0.0',
      showCancel: false, confirmText: '知道了', confirmColor: '#D4A0A0'
    });
  },

  onShareAppMessage() {
    return { title: '悦指间美甲 — 发现你的专属美甲风格', path: '/pages/index/index' };
  }
});
