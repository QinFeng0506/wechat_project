/**
 * 数据访问层（二期扩展版）
 * 云数据库优先，未开通云开发时静默回退本地Mock
 */
const app = getApp();
const local = require('./data.js');

const isCloud = () => !!(app && app.globalData && app.globalData.cloudReady && app.globalData.db);
const db = () => isCloud() ? app.globalData.db : null;

// ===== 本地模式下的管理员改动持久化 =====
// 开通云开发前，管理后台的新增/编辑/删除都记录在这里，
// 读取时合并到 Mock 数据之上，达到"改了立刻生效"的效果。
const getStyleOverrides = () => {
  try {
    const raw = wx.getStorageSync('admin_style_overrides');
    return raw ? JSON.parse(raw) : { added: [], updated: {}, deleted: [] };
  } catch (e) { return { added: [], updated: {}, deleted: [] }; }
};
const saveStyleOverrides = (o) => {
  wx.setStorageSync('admin_style_overrides', JSON.stringify(o));
};

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
  // 合并管理员改动：新增的排最前 → 已删除的过滤掉 → 编辑过的覆盖原字段
  const ov = getStyleOverrides();
  let list = [...ov.added, ...local.nailStyles]
    .filter(s => !ov.deleted.includes(s.id))
    .map(s => ov.updated[s.id] ? { ...s, ...ov.updated[s.id] } : s);
  if (p.category) list = list.filter(s => s.category === p.category);
  if (p.subCategory && p.subCategory !== 'all') list = list.filter(s => s.subCategory === p.subCategory);
  if (p.isHot !== undefined) list = list.filter(s => s.isHot === p.isHot);
  if (p.isNew !== undefined) list = list.filter(s => s.isNew === p.isNew);
  if (p.limit) list = list.slice(0, p.limit);
  return Promise.resolve(list);
};

const getStyleById = async (id) => {
  if (!isCloud()) {
    const list = await fallbackGetStyles({});
    return list.find(s => s.id === id) || null;
  }
  try { const r = await db().collection('nail_styles').where({ id }).get();
    return r.data.length ? r.data[0] : (await fallbackGetStyles({})).find(s => s.id === id) || null;
  } catch (e) { return (await fallbackGetStyles({})).find(s => s.id === id) || null; }
};

// 技师改动持久化（结构同款式）
const getTechOverrides = () => {
  try {
    const raw = wx.getStorageSync('admin_tech_overrides');
    return raw ? JSON.parse(raw) : { added: [], updated: {}, deleted: [] };
  } catch (e) { return { added: [], updated: {}, deleted: [] }; }
};
const saveTechOverrides = (o) => {
  wx.setStorageSync('admin_tech_overrides', JSON.stringify(o));
};

const getTechnicians = async () => {
  if (!isCloud()) {
    // 合并管理员改动：新增排最前 → 删除过滤 → 编辑覆盖
    const ov = getTechOverrides();
    const list = [...ov.added, ...local.technicians]
      .filter(t => !ov.deleted.includes(t.id))
      .map(t => ov.updated[t.id] ? { ...t, ...ov.updated[t.id] } : t);
    return Promise.resolve(list);
  }
  try { const r = await db().collection('technicians').get(); return r.data.length ? r.data : [...local.technicians]; }
  catch (e) { return [...local.technicians]; }
};

// 服务项目改动持久化（结构同款式）
const getServiceOverrides = () => {
  try {
    const raw = wx.getStorageSync('admin_service_overrides');
    return raw ? JSON.parse(raw) : { added: [], updated: {}, deleted: [] };
  } catch (e) { return { added: [], updated: {}, deleted: [] }; }
};
const saveServiceOverrides = (o) => {
  wx.setStorageSync('admin_service_overrides', JSON.stringify(o));
};

const getServiceCategories = async () => {
  if (!isCloud()) {
    // 合并管理员改动：新增排最前 → 删除过滤 → 编辑覆盖
    const ov = getServiceOverrides();
    return Promise.resolve(local.serviceCategories.map(cat => ({
      ...cat,
      items: [...ov.added, ...cat.items]
        .filter(i => !ov.deleted.includes(i.id))
        .map(i => ov.updated[i.id] ? { ...i, ...ov.updated[i.id] } : i)
    })));
  }
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

// 积分商品本地 Mock + 改动持久化
const localPointsGoods = [
  { _id:'g1', name:'纯色美甲体验', type:'service', image:'/images/points/goods1.png', points:200, originalPrice:128, stock:-1, exchangedCount:35, description:'可兑换纯色美甲一次', isActive:true },
  { _id:'g2', name:'法式美甲体验', type:'service', image:'/images/points/goods2.png', points:300, originalPrice:188, stock:-1, exchangedCount:18, description:'可兑换法式美甲一次', isActive:true },
  { _id:'g3', name:'50元代金券', type:'voucher', image:'/images/points/goods3.png', points:500, originalPrice:50, stock:100, exchangedCount:42, description:'满200元可用', isActive:true },
  { _id:'g4', name:'30元代金券', type:'voucher', image:'/images/points/goods4.png', points:300, originalPrice:30, stock:200, exchangedCount:67, description:'满100元可用', isActive:true },
  { _id:'g5', name:'护手霜礼盒', type:'gift', image:'/images/points/goods5.png', points:150, originalPrice:39, stock:30, exchangedCount:12, description:'滋润保湿护手霜3支装', isActive:true },
  { _id:'g6', name:'美甲工具套装', type:'gift', image:'/images/points/goods6.png', points:600, originalPrice:128, stock:15, exchangedCount:5, description:'家用美甲基础工具5件套', isActive:true }
];

const getGoodsOverrides = () => {
  try {
    const raw = wx.getStorageSync('admin_goods_overrides');
    return raw ? JSON.parse(raw) : { added: [], updated: {}, deleted: [] };
  } catch (e) { return { added: [], updated: {}, deleted: [] }; }
};
const saveGoodsOverrides = (o) => {
  wx.setStorageSync('admin_goods_overrides', JSON.stringify(o));
};

const getPointsGoods = async (p = {}) => {
  if (!isCloud()) {
    const ov = getGoodsOverrides();
    let list = [...ov.added, ...localPointsGoods]
      .filter(g => !ov.deleted.includes(g._id))
      .map(g => ov.updated[g._id] ? { ...g, ...ov.updated[g._id] } : g);
    if (!p.includeInactive) list = list.filter(g => g.isActive);
    return Promise.resolve(list);
  }
  try {
    let q = db().collection('points_goods');
    if (!p.includeInactive) q = q.where({ isActive: true });
    const r = await q.get();
    return r.data.length ? r.data : [];
  } catch (e) { return []; }
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
    try { await db().collection('diy_works').add({ data: work }); } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
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

// 公告本地 Mock + 改动持久化
const localNotices = [
  { _id:'nt1', title:'🎉 店庆福利 | 全场美甲8折', content:'即日起至月底，预约到店即享全场美甲项目8折优惠，闺蜜同行第二人半价！', type:'activity', isTop:true, isActive:true, createTime:'2026-08-01' },
  { _id:'nt2', title:'📢 营业时间调整通知', content:'自9月1日起，营业时间调整为 10:00-21:30，敬请留意。', type:'notice', isTop:false, isActive:true, createTime:'2026-08-10' },
  { _id:'nt3', title:'💅 秋季新款已上架', content:'秋季限定枫叶系列、南瓜色系新款已上架，欢迎预约体验！', type:'alert', isTop:false, isActive:true, createTime:'2026-08-08' }
];

const getNoticeOverrides = () => {
  try {
    const raw = wx.getStorageSync('admin_notice_overrides');
    return raw ? JSON.parse(raw) : { added: [], updated: {}, deleted: [] };
  } catch (e) { return { added: [], updated: {}, deleted: [] }; }
};
const saveNoticeOverrides = (o) => {
  wx.setStorageSync('admin_notice_overrides', JSON.stringify(o));
};

const getNotices = async () => {
  if (!isCloud()) {
    const ov = getNoticeOverrides();
    const list = [...ov.added, ...localNotices]
      .filter(n => !ov.deleted.includes(n._id))
      .map(n => ov.updated[n._id] ? { ...n, ...ov.updated[n._id] } : n);
    return Promise.resolve(list);
  }
  try { const r = await db().collection('notices').where({ isActive: true }).orderBy('isTop','desc').orderBy('createTime','desc').get(); return r.data.length ? r.data : []; }
  catch (e) { return []; }
};

/** 保存公告（新增/编辑通用）— 本地持久化 + 云端同步 */
const adminSaveNotice = async (notice) => {
  const ov = getNoticeOverrides();
  if (!notice._id) {
    notice._id = 'nt_' + Date.now();
    notice.isActive = true;
    ov.added = [notice, ...ov.added];
  } else {
    const isKnown = localNotices.some(n => n._id === notice._id) || ov.added.some(n => n._id === notice._id);
    if (isKnown) {
      ov.updated[notice._id] = { ...ov.updated[notice._id], ...notice };
    } else {
      ov.added = [notice, ...ov.added];
    }
  }
  saveNoticeOverrides(ov);

  if (isCloud()) {
    try {
      const r = await db().collection('notices').where({ _id: notice._id }).get();
      if (r.data.length) await db().collection('notices').doc(r.data[0]._id).update({ data: notice });
      else await db().collection('notices').add({ data: notice });
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return notice;
};

/** 保存技师（新增/编辑通用）— 本地持久化 + 云端同步 */
const adminSaveTechnician = async (tech) => {
  const ov = getTechOverrides();
  if (!tech.id) {
    tech.id = 't_' + Date.now();
    tech.rating = tech.rating || 5.0;
    tech.serviceCount = tech.serviceCount || 0;
    tech.slotCount = tech.slotCount || 3;
    tech.isAvailable = tech.isAvailable !== false;
    ov.added = [tech, ...ov.added];
  } else {
    const isKnown = local.technicians.some(t => t.id === tech.id) || ov.added.some(t => t.id === tech.id);
    if (isKnown) {
      ov.updated[tech.id] = { ...ov.updated[tech.id], ...tech };
    } else {
      ov.added = [tech, ...ov.added];
    }
  }
  saveTechOverrides(ov);

  if (isCloud()) {
    try {
      const r = await db().collection('technicians').where({ id: tech.id }).get();
      if (r.data.length) await db().collection('technicians').doc(r.data[0]._id).update({ data: tech });
      else await db().collection('technicians').add({ data: tech });
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return tech;
};

/** 删除技师 — 本地持久化 + 云端同步 */
const adminDeleteTechnician = async (id) => {
  const ov = getTechOverrides();
  ov.deleted.push(id);
  ov.added = ov.added.filter(t => t.id !== id);
  delete ov.updated[id];
  saveTechOverrides(ov);

  if (isCloud()) {
    try {
      const r = await db().collection('technicians').where({ id }).get();
      if (r.data.length) await db().collection('technicians').doc(r.data[0]._id).remove();
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return true;
};

/** 删除公告 — 本地持久化 + 云端同步 */
const adminDeleteNotice = async (id) => {
  const ov = getNoticeOverrides();
  ov.deleted.push(id);
  ov.added = ov.added.filter(n => n._id !== id);
  delete ov.updated[id];
  saveNoticeOverrides(ov);

  if (isCloud()) {
    try {
      const r = await db().collection('notices').where({ _id: id }).get();
      if (r.data.length) await db().collection('notices').doc(r.data[0]._id).remove();
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return true;
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
    try { await db().collection('reviews').add({ data: record }); } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return record;
};

// ===== 二期新增：管理后台 =====

const adminSaveService = async (item) => {
  const ov = getServiceOverrides();
  if (!item.id) {
    item.id = 'si_' + Date.now();
    ov.added = [item, ...ov.added];
  } else {
    const isKnown = local.serviceCategories.some(cat => cat.items.some(i => i.id === item.id)) || ov.added.some(i => i.id === item.id);
    if (isKnown) {
      ov.updated[item.id] = { ...ov.updated[item.id], ...item };
    } else {
      ov.added = [item, ...ov.added];
    }
  }
  saveServiceOverrides(ov);

  // 云端同步：整个分类的 items 数组整体写回
  if (isCloud()) {
    try {
      const cats = await getServiceCategories();
      const target = cats[0];
      if (target) {
        const r = await db().collection('service_categories').where({ id: target.id }).get();
        if (r.data.length) await db().collection('service_categories').doc(r.data[0]._id).update({ data: { items: target.items } });
      }
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return item;
};

const adminDeleteService = async (id) => {
  const ov = getServiceOverrides();
  ov.deleted.push(id);
  ov.added = ov.added.filter(i => i.id !== id);
  delete ov.updated[id];
  saveServiceOverrides(ov);

  if (isCloud()) {
    try {
      const cats = await getServiceCategories();
      const target = cats[0];
      if (target) {
        const r = await db().collection('service_categories').where({ id: target.id }).get();
        if (r.data.length) await db().collection('service_categories').doc(r.data[0]._id).update({ data: { items: target.items } });
      }
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return true;
};

const adminSavePointsGoods = async (goods) => {
  const ov = getGoodsOverrides();
  if (!goods._id) {
    goods._id = 'g_' + Date.now();
    goods.isActive = true;
    goods.exchangedCount = 0;
    ov.added = [goods, ...ov.added];
  } else {
    const isKnown = localPointsGoods.some(g => g._id === goods._id) || ov.added.some(g => g._id === goods._id);
    if (isKnown) {
      ov.updated[goods._id] = { ...ov.updated[goods._id], ...goods };
    } else {
      ov.added = [goods, ...ov.added];
    }
  }
  saveGoodsOverrides(ov);

  // 云端同步
  if (isCloud()) {
    try {
      const r = await db().collection('points_goods').where({ _id: goods._id }).get();
      if (r.data.length) await db().collection('points_goods').doc(r.data[0]._id).update({ data: goods });
      else await db().collection('points_goods').add({ data: goods });
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return goods;
};

const adminUpdatePointsGoods = async (id, patch) => {
  const ov = getGoodsOverrides();
  ov.updated[id] = { ...ov.updated[id], ...patch };
  saveGoodsOverrides(ov);

  if (isCloud()) {
    try {
      const r = await db().collection('points_goods').where({ _id: id }).get();
      if (r.data.length) await db().collection('points_goods').doc(r.data[0]._id).update({ data: patch });
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
};

const adminDeletePointsGoods = async (id) => {
  const ov = getGoodsOverrides();
  ov.deleted.push(id);
  ov.added = ov.added.filter(g => g._id !== id);
  delete ov.updated[id];
  saveGoodsOverrides(ov);

  if (isCloud()) {
    try {
      const r = await db().collection('points_goods').where({ _id: id }).get();
      if (r.data.length) await db().collection('points_goods').doc(r.data[0]._id).remove();
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return true;
};

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
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
};

const adminSaveStyle = async (style) => {
  // 没有 id = 新增，生成一个
  const ov = getStyleOverrides();
  if (!style.id) {
    style.id = 'n_' + Date.now();
    style.isActive = true;
    ov.added = [style, ...ov.added];
  } else {
    const isKnown = local.nailStyles.some(s => s.id === style.id) || ov.added.some(s => s.id === style.id);
    if (isKnown) {
      ov.updated[style.id] = { ...ov.updated[style.id], ...style };
    } else {
      ov.added = [style, ...ov.added];
    }
  }
  saveStyleOverrides(ov);

  // 云端同步（开通云开发后自动生效）
  if (isCloud()) {
    try {
      const r = await db().collection('nail_styles').where({ id: style.id }).get();
      if (r.data.length) await db().collection('nail_styles').doc(r.data[0]._id).update({ data: style });
      else await db().collection('nail_styles').add({ data: style });
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return style;
};

const adminDeleteStyle = async (id) => {
  const ov = getStyleOverrides();
  ov.deleted.push(id);
  ov.added = ov.added.filter(s => s.id !== id);
  delete ov.updated[id];
  saveStyleOverrides(ov);

  // 云端同步（开通云开发后自动生效）
  if (isCloud()) {
    try {
      const r = await db().collection('nail_styles').where({ id }).get();
      if (r.data.length) await db().collection('nail_styles').doc(r.data[0]._id).remove();
    } catch (e) { /* 云端不可用时静默回退本地，不打断操作 */ }
  }
  return true;
};

/**
 * 上传图片 — 云模式上传到云存储；本地模式压缩后转 base64 存本地
 * @param {string} localPath - 选择的图片临时路径
 * @returns {Promise<string>} 云文件ID 或 base64 数据串
 */
const adminUploadImage = async (localPath) => {
  if (isCloud()) {
    const ext = ((localPath.match(/\.(\w+)$/) || [])[1] || 'png').toLowerCase();
    const r = await wx.cloud.uploadFile({
      cloudPath: 'nails/' + Date.now() + '.' + ext,
      filePath: localPath
    });
    return r.fileID;
  }
  // 本地模式：压缩到 60% 质量再转 base64，节省本地存储空间（上限约10MB）
  let compressedPath = localPath;
  try {
    compressedPath = await new Promise((resolve, reject) => {
      wx.compressImage({ src: localPath, quality: 60, success: r => resolve(r.tempFilePath), fail: reject });
    });
  } catch (e) { /* 压缩失败就用原图 */ }
  try {
    const data = await new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: compressedPath, encoding: 'base64',
        success: r => resolve(r.data), fail: reject
      });
    });
    return 'data:image/jpeg;base64,' + data;
  } catch (e) {
    // 兜底：直接返回临时路径（重启小程序后会失效，仅应急）
    return localPath;
  }
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
  adminSaveNotice, adminDeleteNotice,
  adminSaveTechnician, adminDeleteTechnician,
  // 管理后台
  adminGetAllBookings, adminUpdateBookingStatus, adminSaveStyle, adminDeleteStyle, adminUploadImage,
  adminSaveService, adminDeleteService,
  adminSavePointsGoods, adminUpdatePointsGoods, adminDeletePointsGoods
};
