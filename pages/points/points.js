/** 积分中心 */
const app = getApp();
Page({
  data:{ pointsBalance:0, todaySigned:false, signStreak:0, signWeek:[], expiringPoints:0 },
  onShow(){ this.refresh(); },
  refresh(){
    const g = app.globalData;
    const weekDays = ['日','一','二','三','四','五','六'];
    const today = new Date();
    const week = [];
    for(let i=6;i>=0;i--){
      const d = new Date(today); d.setDate(today.getDate()-i);
      week.push({ dayName:weekDays[d.getDay()], bonus:i===0?'+5':(i===6?'+15':'+5'), signed:i>0, isToday:i===0 });
    }
    this.setData({
      pointsBalance: g.pointsBalance, todaySigned: g.todaySigned,
      signStreak: g.signStreak, signWeek: week
    });
  },
  onCheckIn(){
    const res = app.checkIn();
    if(res.success){ wx.showToast({title:res.msg,icon:'none'}); this.refresh(); }
    else wx.showToast({title:res.msg,icon:'none'});
  },
  onGoMall(){ wx.navigateTo({url:'/pages/points-mall/points-mall'}); },
  onGoHistory(){ wx.navigateTo({url:'/pages/points-history/points-history'}); }
});
