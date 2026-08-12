/** 服务项目 — 纯美甲 */
const cloud=require('../../utils/cloud.js');
Page({data:{items:[]},
async onLoad(){
  try{const cats=await cloud.getServiceCategories();this.setData({items:cats[0]?.items||[]});}
  catch(e){this.setData({items:require('../../utils/data.js').serviceCategories[0].items});}
},
onBookNow(){wx.switchTab({url:'/pages/booking/booking'});},
onShareAppMessage(){return{title:'悦指间美甲 — 服务价格',path:'/pages/service/service'};}
});