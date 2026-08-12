/** 积分明细 */
const app = getApp();
Page({
  data:{ pointsBalance:0, records:[] },
  onShow(){
    const recs = app.getPointsRecords();
    this.setData({
      pointsBalance: app.globalData.pointsBalance,
      records: recs.map(r=>({...r, timeStr:r.time?r.time.slice(0,10):''}))
    });
  }
});
