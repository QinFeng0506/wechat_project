/** 首页 — 悦指间美甲 */
const app=getApp();
const cloud=require('../../utils/cloud.js');
Page({data:{banners:[],categories:[],hotStyles:[],newStyles:[],activities:[],latestNotice:null},
/** 每次显示首页都刷新（管理员改公告/款式后，切回首页立即生效） */
async onShow(){
  await this.initPage();
  this.showDisclaimer();
},
/** 弹「项目声明」（配合备案审查）：
 *  管理员 → 不弹；
 *  游客（未登录）→ 每次进入都弹；
 *  已登录用户 → 点过「已知晓」后不再弹 */
showDisclaimer(){
  const g = app.globalData;
  const isLoggedIn = !!(g.userInfo && g.userInfo.nickName);
  if (g.isAdmin) return;
  if (isLoggedIn && wx.getStorageSync('disclaimer_agreed')) return;
  setTimeout(() => {
    wx.showModal({
      title: '项目声明',
      content: '本小程序是开发者个人制作的普通项目，用于记录和展示一个「美甲店小程序」从 0 到 1 的制作过程，包含界面设计、交互逻辑、数据管理等开发细节与思路。\n\n特别声明：本项目仅作技术学习与个人展示用途，不进行任何营销推广，不提供线上销售或交易服务，不收取任何费用，无任何商业行为。小程序内出现的店铺信息、技师资料、服务价格、积分兑换等均为模拟演示数据，请勿用于实际消费参考。\n\n💡 点击下方「不再弹出」按钮：已登录用户将不再显示本提示；游客状态每次进入仍会提醒。',
      showCancel: false,
      confirmText: '不再弹出',
      confirmColor: '#D4A0A0',
      success: () => {
        // 仅登录用户记住「已知晓」；游客下次进入仍会提醒
        const logged = !!(app.globalData.userInfo && app.globalData.userInfo.nickName);
        if (logged) wx.setStorageSync('disclaimer_agreed', true);
      }
    });
  }, 300);
},
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
/** 分类入口：TabBar页面用switchTab，其他用navigateTo */
onCategoryTap(e){const i=e.currentTarget.dataset.item;if(!i.link)return;const tabPages=['/pages/index/index','/pages/gallery/gallery','/pages/booking/booking','/pages/diy/diy','/pages/user/user'];if(tabPages.includes(i.link)){wx.switchTab({url:i.link});}else{wx.navigateTo({url:i.link});}},
onStyleTap(e){wx.navigateTo({url:'/pages/gallery-detail/gallery-detail?id='+e.currentTarget.dataset.id});},
onMoreTap(e){wx.switchTab({url:'/pages/gallery/gallery'});},
onNoticeTap(){wx.navigateTo({url:'/pages/notice/notice'});},
onShareAppMessage(){return{title:'悦指间美甲',path:'/pages/index/index'};}
});