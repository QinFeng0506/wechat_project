const cloud=require('../../utils/cloud.js');
Page({data:{work:null},async onLoad(o){const w=(await cloud.getDiyWorks()).find(x=>x._id===o.id);this.setData({work:w||null});},
onShareWork(){wx.showToast({title:'请截图分享给好友',icon:'none'});},
onBook(){wx.switchTab({url:'/pages/booking/booking'});}
});