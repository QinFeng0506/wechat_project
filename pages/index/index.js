/** 首页 — 悦指间美甲 */
const app=getApp();
const cloud=require('../../utils/cloud.js');
Page({data:{banners:[],categories:[],hotStyles:[],newStyles:[],activities:[],latestNotice:null},
async onLoad(){await this.initPage();},
async initPage(){
  try{
    const[banners,hotStyles,newStyles,activities,notices]=await Promise.all([
      cloud.getBanners(),cloud.getStyles({isHot:true,limit:6}),
      cloud.getStyles({isNew:true,limit:4}),cloud.getActivities(),cloud.getNotices()
    ]);
    this.setData({banners,categories:[
      {id:'c1',name:'款式图库',icon:'💅',link:'/pages/gallery/gallery'},
      {id:'c2',name:'服务价格',icon:'📋',link:'/pages/service/service'}
    ],hotStyles,newStyles,activities,latestNotice:notices.length?notices[0]:null});
  }catch(e){
    const{banners,activities,nailStyles}=require('../../utils/data.js');
    this.setData({banners,categories:[
      {id:'c1',name:'款式图库',icon:'💅',link:'/pages/gallery/gallery'},
      {id:'c2',name:'服务价格',icon:'📋',link:'/pages/service/service'}
    ],activities,hotStyles:nailStyles.filter(s=>s.isHot).slice(0,6),newStyles:nailStyles.filter(s=>s.isNew).slice(0,4)});
  }
},
onBannerTap(e){const i=e.currentTarget.dataset.item;if(i.link)wx.navigateTo({url:i.link});},
onCategoryTap(e){const i=e.currentTarget.dataset.item;if(i.link)wx.navigateTo({url:i.link});},
onStyleTap(e){wx.navigateTo({url:'/pages/gallery-detail/gallery-detail?id='+e.currentTarget.dataset.id});},
onMoreTap(e){wx.switchTab({url:'/pages/gallery/gallery'});},
onNoticeTap(){wx.navigateTo({url:'/pages/notice/notice'});},
onShareAppMessage(){return{title:'悦指间美甲',path:'/pages/index/index'};}
});