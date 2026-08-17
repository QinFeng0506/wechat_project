/**
 * 管理页门禁 — 非管理员禁止进入管理页面（二次查验）
 * 用法：在管理页面的 onLoad / onShow 第一行调用：
 *   if (!guardAdmin()) return;
 * 灵感比喻：小区门口有保安还不够，每栋楼进门还要再刷一次门禁卡。
 */
const guardAdmin = () => {
  const app = getApp();
  if (!app.globalData.isAdmin) {
    wx.showToast({ title: '请先通过管理员登录', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 600);
    return false;
  }
  return true;
};

module.exports = { guardAdmin };
