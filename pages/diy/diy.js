const app=getApp();
const cloud=require('../../utils/cloud.js');
Page({data:{works:[],templates:[]},
async onShow(){const[w,t]=await Promise.all([cloud.getDiyWorks(),cloud.getDiyTemplates()]);this.setData({works:w.slice(0,5),templates:t});},
onStartDiy(){wx.navigateTo({url:'/pages/diy-editor/diy-editor'});},
onWorkTap(e){wx.navigateTo({url:'/pages/diy-work/diy-work?id='+e.currentTarget.dataset.id});},
onUseTemplate(e){app.globalData.diyTemplate=e.currentTarget.dataset.tp;wx.navigateTo({url:'/pages/diy-editor/diy-editor'});}
});