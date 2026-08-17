/**
 * 云函数 - 一键初始化数据库（纯美甲版）
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const nailStyles = [
  { id:'n001',name:'法式渐变美甲',category:'nail',subCategory:'法式',images:['/images/nails/nail1.png','/images/nails/nail1_2.png'],coverImage:'/images/nails/nail1.png',price:238,duration:90,description:'经典法式白边搭配自然裸粉渐变，简约优雅不挑肤色。',tags:['日常','通勤','约会'],technicianIds:['t001','t002','t003'],isHot:true,isNew:false,createTime:'2026-08-01'},
  { id:'n002',name:'猫眼石光美甲',category:'nail',subCategory:'猫眼',images:['/images/nails/nail2.png','/images/nails/nail2_2.png'],coverImage:'/images/nails/nail2.png',price:288,duration:90,description:'磁石猫眼工艺打造宝石光泽，不同角度折射迷人光晕。',tags:['派对','个性','高级感'],technicianIds:['t001','t002'],isHot:true,isNew:false,createTime:'2026-08-02'},
  { id:'n003',name:'樱花粉纯色美甲',category:'nail',subCategory:'纯色',images:['/images/nails/nail3.png'],coverImage:'/images/nails/nail3.png',price:128,duration:60,description:'温柔樱花粉色，单色简约不简单。非常适合初次美甲的客户。',tags:['日常','甜美','新手'],technicianIds:['t001','t002','t003'],isHot:false,isNew:true,createTime:'2026-08-10'},
  { id:'n004',name:'星空渐变美甲',category:'nail',subCategory:'渐变',images:['/images/nails/nail4.png','/images/nails/nail4_2.png'],coverImage:'/images/nails/nail4.png',price:268,duration:90,description:'深蓝到紫的梦幻渐变，点缀细闪亮片如繁星点点。',tags:['派对','约会','拍照'],technicianIds:['t001','t003'],isHot:true,isNew:false,createTime:'2026-08-03'},
  { id:'n005',name:'3D立体雕花美甲',category:'nail',subCategory:'雕花',images:['/images/nails/nail5.png'],coverImage:'/images/nails/nail5.png',price:388,duration:120,description:'精致3D立体花朵手工雕制，适合婚礼、重要场合。',tags:['婚礼','重要场合','精致'],technicianIds:['t001'],isHot:false,isNew:true,createTime:'2026-08-09'},
  { id:'n006',name:'极简裸色美甲',category:'nail',subCategory:'纯色',images:['/images/nails/nail6.png'],coverImage:'/images/nails/nail6.png',price:128,duration:60,description:'低饱和裸色系，修饰甲型显手白。极简风爱好者首选。',tags:['日常','通勤','极简'],technicianIds:['t002','t003'],isHot:false,isNew:false,createTime:'2026-07-20'},
  { id:'n007',name:'珍珠贝壳美甲',category:'nail',subCategory:'贴片',images:['/images/nails/nail7.png','/images/nails/nail7_2.png'],coverImage:'/images/nails/nail7.png',price:328,duration:105,description:'贝壳碎片+珍珠装饰，波光粼粼的海洋风。',tags:['度假','约会','海洋风'],technicianIds:['t002'],isHot:true,isNew:false,createTime:'2026-08-05'},
  { id:'n008',name:'甜美腮红甲',category:'nail',subCategory:'渐变',images:['/images/nails/nail8.png'],coverImage:'/images/nails/nail8.png',price:218,duration:75,description:'透感腮红渐变，少女感爆棚的韩系爆款。',tags:['甜美','韩系','约会'],technicianIds:['t001','t002','t003'],isHot:false,isNew:false,createTime:'2026-07-25'}
];

const technicians = [
  { id:'t001',slotCount:3,name:'小雅',avatar:'/images/technicians/t1.png',title:'资深美甲师',experience:6,specialties:['法式','猫眼','3D雕花','手绘'],description:'从业6年，曾在上海高端美甲沙龙任职。擅长法式美甲和3D雕花工艺。',rating:4.9,serviceCount:2180,isAvailable:true},
  { id:'t002',slotCount:3,name:'思语',avatar:'/images/technicians/t2.png',title:'高级美甲师',experience:4,specialties:['渐变','珍珠贝壳','贴片延长','手绘'],description:'从业4年，擅长渐变美甲和创意造型，手法轻柔细致，客户好评率超高。',rating:4.8,serviceCount:1560,isAvailable:true},
  { id:'t003',slotCount:3,name:'灵儿',avatar:'/images/technicians/t3.png',title:'美甲师',experience:3,specialties:['纯色','腮红甲','韩系','渐变'],description:'从业3年，温柔细心。擅长韩系清新风美甲，价格亲民服务到位。',rating:4.7,serviceCount:980,isAvailable:true}
];

const serviceCategories = [
  { id:'sc001',name:'美甲',icon:'💅',items:[
    {id:'si001',name:'纯色美甲',price:128,duration:60,desc:'进口环保甲油胶'},
    {id:'si002',name:'法式美甲',price:188,duration:75,desc:'经典白边法式'},
    {id:'si003',name:'猫眼美甲',price:238,duration:90,desc:'磁石工艺宝石光泽'},
    {id:'si004',name:'渐变美甲',price:268,duration:90,desc:'海绵晕染自然过渡'},
    {id:'si005',name:'贴片延长',price:328,duration:105,desc:'无痕延长+造型设计'},
    {id:'si006',name:'3D雕花',price:388,duration:120,desc:'手工立体花朵定制'},
    {id:'si007',name:'手绘花型',price:358,duration:120,desc:'精细手工绘制'}
  ]}
];

const banners = [
  { id:'b001',image:'/images/banner/banner1.png',title:'夏日清新美甲',link:'/pages/gallery/gallery' },
  { id:'b002',image:'/images/banner/banner2.png',title:'新客专享优惠',link:'/pages/service/service' },
  { id:'b003',image:'/images/banner/banner3.png',title:'法式经典系列',link:'/pages/gallery/gallery?subCategory=法式' }
];

const activities = [
  { id:'a001',title:'新客首次体验享8折优惠',desc:'到店出示小程序即可享受优惠，每人限用一次',coverColor:'#F5EBEB',tag:'新客专享' },
  { id:'a002',title:'闺蜜同行 第二人半价',desc:'两人同时预约美甲项目，第二人享半价优惠',coverColor:'#F0EEE5',tag:'限时活动' }
];

const storeInfo = {
  name:'悦指间美甲',address:'XX市XX区XX路XX号XX商场2楼202铺',
  latitude:39.9042,longitude:116.4074,phone:'138-0000-0000',
  businessHours:'周一至周日 10:00 - 21:00',
  images:['/images/store/store1.png','/images/store/store2.png','/images/store/store3.png'],
  description:'悦指间美甲成立于2020年，专注高品质美甲服务。进口环保甲油胶，严格消毒，为你打造独一无二的精致美甲体验。'
};

const pointsGoods = [
  { name:'纯色美甲体验',type:'service',image:'/images/points/goods1.png',points:200,originalPrice:128,stock:-1,exchangedCount:35,description:'可兑换纯色美甲一次',isActive:true },
  { name:'法式美甲体验',type:'service',image:'/images/points/goods2.png',points:300,originalPrice:188,stock:-1,exchangedCount:18,description:'可兑换法式美甲一次',isActive:true },
  { name:'50元代金券',type:'voucher',image:'/images/points/goods3.png',points:500,originalPrice:50,stock:100,exchangedCount:42,description:'满200元可用',isActive:true },
  { name:'30元代金券',type:'voucher',image:'/images/points/goods4.png',points:300,originalPrice:30,stock:200,exchangedCount:67,description:'满100元可用',isActive:true },
  { name:'护手霜礼盒',type:'gift',image:'/images/points/goods5.png',points:150,originalPrice:39,stock:30,exchangedCount:12,description:'滋润保湿护手霜3支装',isActive:true },
  { name:'美甲工具套装',type:'gift',image:'/images/points/goods6.png',points:600,originalPrice:128,stock:15,exchangedCount:5,description:'家用美甲基础工具5件套',isActive:true }
];

const notices = [
  { title:'🎉 店庆福利 | 全场美甲8折',content:'即日起至月底，预约到店即享全场美甲项目8折优惠，闺蜜同行第二人半价！',type:'activity',isTop:true,isActive:true,createTime:'2026-08-01' },
  { title:'📢 营业时间调整通知',content:'自9月1日起，营业时间调整为 10:00-21:30，敬请留意。',type:'notice',isTop:false,isActive:true,createTime:'2026-08-10' },
  { title:'💅 秋季新款已上架',content:'秋季限定枫叶系列、南瓜色系新款已上架，欢迎预约体验！',type:'alert',isTop:false,isActive:true,createTime:'2026-08-08' }
];

async function batchInsert(colName, dataArray) {
  const col = db.collection(colName);
  const exist = await col.get();
  for (const doc of exist.data) await col.doc(doc._id).remove();
  for (let i = 0; i < dataArray.length; i += 50)
    await Promise.all(dataArray.slice(i, i + 50).map(item => col.add({ data: item })));
  return dataArray.length;
}

exports.main = async (event, context) => {
  const results = {};
  const collections = [
    ['nail_styles', nailStyles], ['technicians', technicians],
    ['service_categories', serviceCategories], ['banners', banners],
    ['activities', activities], ['points_goods', pointsGoods], ['notices', notices]
  ];
  for (const [name, data] of collections) {
    try { results[name] = await batchInsert(name, data); }
    catch (e) { results[name] = 'ERROR: ' + e.message; }
  }
  try {
    const sc = db.collection('store_info');
    const ex = await sc.get();
    for (const d of ex.data) await sc.doc(d._id).remove();
    await sc.add({ data: storeInfo });
    results.store_info = 1;
  } catch (e) { results.store_info = 'ERROR: ' + e.message; }
  return { success: true, message: '纯美甲版初始化完成', results };
};
