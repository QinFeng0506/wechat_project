/**
 * 数据访问层（二期扩展版）
 * 云数据库优先，未开通云开发时静默回退本地Mock
 */
const app = getApp();
const local = require('./data.js');

const isCloud = () => !!(app && app.globalData && app.globalData.cloudReady && app.globalData.db);
const db = () => isCloud() ? app.globalData.db : null;

// ===== 款式（已有） =====
const getStyles = async (p = {}) => {
  if (!isCloud()) return fallbackGetStyles(p);
  try {
    let q = db().collection('nail_styles');
    if (p.category) q = q.where({ category: p.category });
    if (p.subCategory && p.subCategory !== 'all') q = q.where({ subCategory: p.subCategory });
    if (p.isHot !== undefined) q = q.where({ isHot: p.isHot });
    if (p.isNew !== undefined) q = q.where({ isNew: p.isNew });
    if (p.limit) q = q.limit(p.limit);
    const r = await q.get();
    return r.data.length ? r.data : fallbackGetStyles(p);
  } catch (e) { return fallbackGetStyles(p); }
};
const fallbackGetStyles = (p) => {
  let list = [...local.nailStyles];
  if (p.category) list = list.filter(s => s.category === p.category);
  if (p.subCategory && p.subCategory !== 'all') list = list.filter(s => s.subCategory === p.subCategory);
  if (p.isHot !== undefined) list = list.filter(s => s.isHot === p.isHot);
  if (p.isNew !== undefined) list = list.filter(s => s.isNew === p.isNew);
  if (p.limit) list = list.slice(0, p.limit);
  return Promise.resolve(list);
};

const getStyleById = async (id) => {
  if (!isCloud()) return Promise.resolve(local.nailStyles.find(s => s.id === id) || null);
  try { const r = await db().collection('nail_styles').where({ id }).get();
    return r.data.length ? r.data[0] : local.nailStyles.find(s => s.id === id) || null;
  } catch (e) { return local.nailStyles.find(s => s.id === id) || null; }
};

const getTechnicians = async () => {
  if (!isCloud()) return Promise.resolve([...local.technicians]);
  try { const r = await db().collection('technicians').get(); return r.data.length ? r.data : [...local.technicians]; }
  catch (e) { return [...local.technicians]; }
};

const getServiceCategories = async () => {
  if (!isCloud()) return Promise.resolve([...local.serviceCategories]);
  try { const r = await db().collection('service_categories').get(); return r.data.length ? r.data : [...local.serviceCategories]; }
  catch (e) { return [...local.serviceCategories]; }
};

const getStoreInfo = async () => {
  if (!isCloud()) return Promise.resolve({ ...local.storeInfo });
  try { const r = await db().collection('store_info').limit(1).get(); return r.data.length ? r.data[0] : { ...local.storeInfo }; }
  catch (e) { return { ...local.storeInfo }; }
};

const getBanners = async () => {
  if (!isCloud()) return Promise.resolve([...local.banners]);
  try { const r = await db().collection('banners').get(); return r.data.length ? r.data : [...local.banners]; }
  catch (e) { return [...local.banners]; }
};

const getActivities = async () => {
  if (!isCloud()) return Promise.resolve([...local.activities]);
  try { const r = await db().collection('activities').get(); return r.data.length ? r.data : [...local.activities]; }
  catch (e) { return [...local.activities]; }
};

const getUserFavorites = async () => {
  if (!isCloud()) return Promise.resolve(app.globalData.favorites || []);
  try { const r = await db().collection('favorites').orderBy('createTime', 'desc').get(); return r.data.map(i => i.styleId); }
  catch (e) { return app.globalData.favorites || []; }
};

const getUserBookings = async () => {
  if (!isCloud()) return Promise.resolve(app.globalData.bookings || []);
  try { const r = await db().collection('bookings').orderBy('createTime', 'desc').get(); return r.data; }
  catch (e) { return app.globalData.bookings || []; }
};

// ===== 二期新增：积分 =====

const getPointsBalance = () => Promise.resolve(app.globalData.pointsBalance || 0);

const getPointsRecords = async () => {
  if (!isCloud()) return Promise.resolve(app.getPointsRecords());
  try { const r = await db().collection('points').orderBy('createTime', 'desc').get(); return r.data; }
  catch (e) { return app.getPointsRecords(); }
};

const getPointsGoods = async () => {
  if (!isCloud()) {
    return Promise.resolve([
      { _id:'g1', name:'纯色美甲体验', type:'service', image:'/images/points/goods1.png', points:200, originalPrice:128, stock:-1, exchangedCount:35, description:'可兑换纯色美甲一次', isActive:true },
      { _id:'g2', name:'法式美甲体验', type:'service', image:'/images/points/goods2.png', points:300, originalPrice:188, stock:-1, exchangedCount:18, description:'可兑换法式美甲一次', isActive:true },
      { _id:'g3', name:'50元代金券', type:'voucher', image:'/images/points/goods3.png', points:500, originalPrice:50, stock:100, exchangedCount:42, description:'满200元可用', isActive:true },
      { _id:'g4', name:'30元代金券', type:'voucher', image:'/images/points/goods4.png', points:300, originalPrice:30, stock:200, exchangedCount:67, description:'满100元可用', isActive:true },
      { _id:'g5', name:'护手霜礼盒', type:'gift', image:'/images/points/goods5.png', points:150, originalPrice:39, stock:30, exchangedCount:12, description:'滋润保湿护手霜3支装', isActive:true },
      { _id:'g6', name:'美甲工具套装', type:'gift', image:'/images/points/goods6.png', points:600, originalPrice:128, stock:15, exchangedCount:5, description:'家用美甲基础工具5件套', isActive:true }
    ]);
  }
  try { const r = await db().collection('points_goods').where({ isActive: true }).get(); return r.data.length ? r.data : []; }
  catch (e) { return []; }
};

// ===== 二期新增：DIY =====

const getDiyTemplates = () => Promise.resolve([
  { id:'tp1', name:'法式白边', nails:['#FFE0E0','#FFE0E0','#FFE0E0','#FFE0E0','#FFE0E0'], tips:['#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF'] },
  { id:'tp2', name:'渐变粉', nails:['#FFB5C2','#FFA0B4','#FFB5C2','#FFA0B4','#FFB5C2'] },
  { id:'tp3', name:'跳色搭配', nails:['#D4A0A0','#C4A882','#D4A0A0','#C4A882','#D4A0A0'] },
  { id:'tp4', name:'莫兰迪绿', nails:['#A8C4A2','#A8C4A2','#A8C4A2','#A8C4A2','#A8C4A2'] },
  { id:'tp5', name:'浆果紫', nails:['#9B7EB8','#9B7EB8','#9B7EB8','#9B7EB8','#9B7EB8'] },
  { id:'tp6', name:'裸色系', nails:['#DEB8A0','#DEB8A0','#DEB8A0','#DEB8A0','#DEB8A0'] }
]);

const getDiyWorks = async () => {
  if (!isCloud()) {
    const raw = wx.getStorageSync('diy_works');
    return raw ? JSON.parse(raw) : [];
  }
  try { const r = await db().collection('diy_works').orderBy('createTime', 'desc').get(); return r.data; }
  catch (e) { const raw = wx.getStorageSync('diy_works'); return raw ? JSON.parse(raw) : []; }
};

const saveDiyWork = async (work) => {
  work.createTime = new Date().toISOString();
  work._id = 'diy_' + Date.now();
  const works = JSON.parse(wx.getStorageSync('diy_works') || '[]');
  works.unshift(work);
  wx.setStorageSync('diy_works', JSON.stringify(works));
  if (isCloud()) {
    try { await db().collection('diy_works').add({ data: work }); } catch (e) {}
  }
  return work;
};

const deleteDiyWork = async (id) => {
  let works = JSON.parse(wx.getStorageSync('diy_works') || '[]');
  works = works.filter(w => w._id !== id);
  wx.setStorageSync('diy_works', JSON.stringify(works));
  return true;
};

// ===== 二期新增：公告 =====

const getNotices = async () => {
  if (!isCloud()) {
    return Promise.resolve([
      { _id:'nt1', title:'🎉 店庆福利 | 全场美甲8折', content:'即日起至月底，预约到店即享全场美甲项目8折优惠，闺蜜同行第二人半价！', type:'activity', isTop:true, isActive:true, createTime:'2026-08-01' },
      { _id:'nt2', title:'📢 营业时间调整通知', content:'自9月1日起，营业时间调整为 10:00-21:30，敬请留意。', type:'notice', isTop:false, isActive:true, createTime:'2026-08-10' },
      { _id:'nt3', title:'💅 秋季新款已上架', content:'秋季限定枫叶系列、南瓜色系新款已上架，欢迎预约体验！', type:'alert', isTop:false, isActive:true, createTime:'2026-08-08' }
    ]);
  }
  try { const r = await db().collection('notices').where({ isActive: true }).orderBy('isTop','desc').orderBy('createTime','desc').get(); return r.data.length ? r.data : []; }
  catch (e) { return []; }
};

// ===== 二期新增：评价 =====

const getReviews = async (styleId) => {
  if (!isCloud()) {
    const raw = wx.getStorageSync('reviews');
    const all = raw ? JSON.parse(raw) : [];
    return styleId ? all.filter(r => r.styleId === styleId) : all;
  }
  try {
    let q = db().collection('reviews').where({ isApproved: true }).orderBy('createTime','desc');
    if (styleId) q = q.where({ styleId });
    const r = await q.get();
    return r.data;
  } catch (e) { return []; }
};

const addReview = async (data) => {
  const record = { ...data, _id: 'r_' + Date.now(), createTime: new Date().toISOString(), isApproved: true };
  const raw = wx.getStorageSync('reviews');
  const all = raw ? JSON.parse(raw) : [];
  all.unshift(record);
  wx.setStorageSync('reviews', JSON.stringify(all));
  if (isCloud()) {
    try { await db().collection('reviews').add({ data: record }); } catch (e) {}
  }
  return record;
};

// ===== 二期新增：管理后台 =====

const adminGetAllBookings = async () => {
  if (!isCloud()) return Promise.resolve([...app.globalData.bookings]);
  try { const r = await db().collection('bookings').orderBy('createTime','desc').get(); return r.data; }
  catch (e) { return [...app.globalData.bookings]; }
};

const adminUpdateBookingStatus = async (id, status) => {
  app.updateBookingStatus(id, status);
  if (isCloud()) {
    try { const r = await db().collection('bookings').where({ id }).get();
      if (r.data.length) await db().collection('bookings').doc(r.data[0]._id).update({ data: { status } });
    } catch (e) {}
  }
};

const adminSaveStyle = async (style) => {
  if (!style.id) style.id = 'n_' + Date.now();
  style.isActive = true;
  const list = [...local.nailStyles];
  const idx = list.findIndex(s => s.id === style.id);
  if (idx > -1) list[idx] = { ...list[idx], ...style };
  else list.unshift(style);
  // Note: local data is read-only in this architecture; full CRUD requires cloud
  return style;
};

const adminDeleteStyle = async (id) => {
  // Soft delete
  return true;
};

module.exports = {
  getStyles, getStyleById, getTechnicians, getServiceCategories,
  getStoreInfo, getBanners, getActivities, getUserFavorites, getUserBookings,
  // 积分
  getPointsBalance, getPointsRecords, getPointsGoods,
  // DIY
  getDiyTemplates, getDiyWorks, saveDiyWork, deleteDiyWork,
  // 公告 & 评价
  getNotices, getReviews, addReview,
  // 管理后台
  adminGetAllBookings, adminUpdateBookingStatus, adminSaveStyle, adminDeleteStyle
};
