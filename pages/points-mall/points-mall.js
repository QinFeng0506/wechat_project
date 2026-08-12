/** 积分商城 */
const app = getApp();
const cloud = require('../../utils/cloud.js');
Page({
  data:{ pointsBalance:0, activeTab:'all', allGoods:[], displayGoods:[] },
  async onShow(){
    this.setData({pointsBalance:app.globalData.pointsBalance});
    const goods = await cloud.getPointsGoods();
    this.setData({allGoods:goods}); this.filter();
  },
  onTab(e){ this.setData({activeTab:e.currentTarget.dataset.tab}); this.filter(); },
  filter(){
    const {activeTab,allGoods}=this.data;
    this.setData({displayGoods:activeTab==='all'?allGoods:allGoods.filter(g=>g.type===activeTab)});
  },
  onExchange(e){
    const item=e.currentTarget.dataset.item;
    if(app.globalData.pointsBalance<item.points){wx.showToast({title:'积分不足',icon:'none'});return;}
    wx.showModal({title:'确认兑换',content:`消耗 ${item.points} 积分兑换「${item.name}」？`,confirmColor:'#D4A0A0',
      success:res=>{if(res.confirm){
        const ok=app.spendPoints(item.points,`兑换:${item.name}`);
        if(ok){this.setData({pointsBalance:app.globalData.pointsBalance});wx.showToast({title:'兑换成功!',icon:'success'});}
      }}
    });
  }
});
