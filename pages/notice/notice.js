const cloud=require('../../utils/cloud.js');
Page({data:{notices:[]},async onShow(){this.setData({notices:await cloud.getNotices()})},
onTap(e){const n=e.currentTarget.dataset.item;wx.showModal({title:n.title,content:n.content,showCancel:false,confirmText:'知道了',confirmColor:'#D4A0A0'});}
});