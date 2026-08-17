/**
 * 模拟数据 — 悦指间美甲（纯美甲版）
 */

const banners = [
  { id:'b001', image:'/images/banner/banner1.png', title:'夏日清新美甲', link:'/pages/gallery/gallery' },
  { id:'b002', image:'/images/banner/banner2.png', title:'新客专享优惠', link:'/pages/service/service' },
  { id:'b003', image:'/images/banner/banner3.png', title:'法式经典系列', link:'/pages/gallery/gallery?subCategory=法式' }
];

const categoryEntries = [
  { id:'c001', name:'款式图库', icon:'💅', link:'/pages/gallery/gallery' },
  { id:'c002', name:'服务价格', icon:'📋', link:'/pages/service/service' }
];

const activities = [
  { id:'a001', title:'新客首次体验享8折优惠', desc:'到店出示小程序即可享受优惠，每人限用一次', coverColor:'#F5EBEB', tag:'新客专享' },
  { id:'a002', title:'闺蜜同行 第二人半价', desc:'两人同时预约美甲项目，第二人享半价优惠', coverColor:'#F0EEE5', tag:'限时活动' }
];

/** 美甲款式（8款） */
const nailStyles = [
  { id:'n001', name:'法式渐变美甲', category:'nail', subCategory:'法式', images:['/images/nails/nail1.png','/images/nails/nail1_2.png'], coverImage:'/images/nails/nail1.png', price:238, duration:90, description:'经典法式白边搭配自然裸粉渐变，简约优雅不挑肤色。指尖透出天然好气色，日常通勤或约会都适合，是店内人气 TOP1 款式。', tags:['日常','通勤','约会'], technicianIds:['t001','t002','t003'], isHot:true, isNew:false },
  { id:'n002', name:'猫眼石光美甲', category:'nail', subCategory:'猫眼', images:['/images/nails/nail2.png','/images/nails/nail2_2.png'], coverImage:'/images/nails/nail2.png', price:288, duration:90, description:'磁石猫眼工艺打造宝石光泽，不同角度折射迷人光晕。深色系高级感十足，适合追求个性的你。', tags:['派对','个性','高级感'], technicianIds:['t001','t002'], isHot:true, isNew:false },
  { id:'n003', name:'樱花粉纯色美甲', category:'nail', subCategory:'纯色', images:['/images/nails/nail3.png'], coverImage:'/images/nails/nail3.png', price:128, duration:60, description:'温柔樱花粉色，单色简约不简单。进口环保甲油胶，色泽饱满持久。非常适合初次美甲的客户。', tags:['日常','甜美','新手'], technicianIds:['t001','t002','t003'], isHot:false, isNew:true },
  { id:'n004', name:'星空渐变美甲', category:'nail', subCategory:'渐变', images:['/images/nails/nail4.png','/images/nails/nail4_2.png'], coverImage:'/images/nails/nail4.png', price:268, duration:90, description:'深蓝到紫的梦幻渐变，点缀细闪亮片如繁星点点。派对聚会吸睛神器，拍照超出片。', tags:['派对','约会','拍照'], technicianIds:['t001','t003'], isHot:true, isNew:false },
  { id:'n005', name:'3D立体雕花美甲', category:'nail', subCategory:'雕花', images:['/images/nails/nail5.png'], coverImage:'/images/nails/nail5.png', price:388, duration:120, description:'精致3D立体花朵手工雕制，每一朵都是独一无二的艺术品。适合婚礼、重要场合，让你指尖绽放。', tags:['婚礼','重要场合','精致'], technicianIds:['t001'], isHot:false, isNew:true },
  { id:'n006', name:'极简裸色美甲', category:'nail', subCategory:'纯色', images:['/images/nails/nail6.png'], coverImage:'/images/nails/nail6.png', price:128, duration:60, description:'低饱和裸色系，修饰甲型显手白。极简风爱好者首选，干净利落的高级感。', tags:['日常','通勤','极简'], technicianIds:['t002','t003'], isHot:false, isNew:false },
  { id:'n007', name:'珍珠贝壳美甲', category:'nail', subCategory:'贴片', images:['/images/nails/nail7.png','/images/nails/nail7_2.png'], coverImage:'/images/nails/nail7.png', price:328, duration:105, description:'贝壳碎片+珍珠装饰，波光粼粼的海洋风。立体质感超棒，度假出行必做款式。', tags:['度假','约会','海洋风'], technicianIds:['t002'], isHot:true, isNew:false },
  { id:'n008', name:'甜美腮红甲', category:'nail', subCategory:'渐变', images:['/images/nails/nail8.png'], coverImage:'/images/nails/nail8.png', price:218, duration:75, description:'透感腮红渐变，就像指尖打了腮红一样自然可爱。少女感爆棚的韩系爆款。', tags:['甜美','韩系','约会'], technicianIds:['t001','t002','t003'], isHot:false, isNew:false }
];

const subCategories = {
  nail: [
    { id:'all', name:'全部' },
    { id:'纯色', name:'纯色' },
    { id:'法式', name:'法式' },
    { id:'猫眼', name:'猫眼' },
    { id:'渐变', name:'渐变' },
    { id:'贴片', name:'贴片' },
    { id:'雕花', name:'雕花' }
  ]
};

/** 技师（纯美甲方向） */
const technicians = [
  { id:'t001', slotCount:3, name:'小雅', avatar:'/images/technicians/t1.png', title:'资深美甲师', experience:6, specialties:['法式','猫眼','3D雕花','手绘'], description:'从业6年，曾在上海高端美甲沙龙任职。擅长法式美甲和3D雕花工艺，多次获得美甲大赛奖项。对待每一位客人都十分耐心细致，会根据手型肤色量身推荐最适合的款式。', rating:4.9, serviceCount:2180, isAvailable:true },
  { id:'t002', slotCount:3, name:'思语', avatar:'/images/technicians/t2.png', title:'高级美甲师', experience:4, specialties:['渐变','珍珠贝壳','贴片延长','手绘'], description:'从业4年，尤其擅长渐变美甲和创意造型，手法轻柔细致，客户好评率超高。喜欢研究最新流行趋势，总能给你带来惊喜。', rating:4.8, serviceCount:1560, isAvailable:true },
  { id:'t003', slotCount:3, name:'灵儿', avatar:'/images/technicians/t3.png', title:'美甲师', experience:3, specialties:['纯色','腮红甲','韩系','极简风'], description:'从业3年，温柔细心。擅长韩系清新风美甲，价格亲民服务到位，非常适合追求性价比的客户和学生党。', rating:4.7, serviceCount:980, isAvailable:true }
];

/** 服务项目（仅美甲） */
const serviceCategories = [
  { id:'sc001', name:'美甲', icon:'💅', items:[
    { id:'si001', name:'纯色美甲', price:128, duration:60, desc:'进口环保甲油胶，饱满均匀色泽' },
    { id:'si002', name:'法式美甲', price:188, duration:75, desc:'经典白边法式，简约优雅' },
    { id:'si003', name:'猫眼美甲', price:238, duration:90, desc:'磁石吸附工艺，宝石光泽' },
    { id:'si004', name:'渐变美甲', price:268, duration:90, desc:'海绵晕染自然过渡，多色可选' },
    { id:'si005', name:'贴片延长', price:328, duration:105, desc:'无痕延长+造型设计一举两得' },
    { id:'si006', name:'3D雕花', price:388, duration:120, desc:'手工立体花朵，独家定制设计' },
    { id:'si007', name:'手绘花型', price:358, duration:120, desc:'精细手工绘制，独一无二' }
  ]}
];

const storeInfo = {
  name:'悦指间美甲', logo:'/images/store/logo.png',
  address:'XX市XX区XX路XX号XX商场2楼202铺',
  latitude:39.9042, longitude:116.4074,
  phone:'138-0000-0000', businessHours:'周一至周日 10:00 - 21:00',
  images:['/images/store/store1.png','/images/store/store2.png','/images/store/store3.png'],
  description:'悦指间美甲成立于2020年，专注高品质美甲服务。采用进口环保甲油胶，严格消毒流程，为每位客户打造独一无二的精致美甲体验。'
};

const aboutInfo = { version:'v2.0.0', name:'悦指间美甲', slogan:'让美丽绽放指尖', description:'悦指间美甲小程序，提供在线款式浏览、服务预约、技师选择等便捷功能。' };

module.exports = { banners, categoryEntries, activities, nailStyles, subCategories, technicians, serviceCategories, storeInfo, aboutInfo };
