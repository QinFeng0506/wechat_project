/** 服务项目 — 纯美甲 */
const cloud=require('../../utils/cloud.js');
Page({data:{items:[]},
/** 每次显示都刷新（管理员改价格后返回即可见） */
async onShow(){
  try{const cats=await cloud.getServiceCategories();this.setData({items:cats[0]?.items||[]});}
  catch(e){this.setData({items:require('../../utils/data.js').serviceCategories[0].items});}
},
onBookNow(){wx.switchTab({url:'/pages/booking/booking'});},
onShareAppMessage(){return{title:'悦指间美甲 — 服务价格',path:'/pages/service/service'};}
});