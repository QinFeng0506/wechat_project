/** 款式图库 — 纯美甲版 */
const app=getApp();
const cloud=require('../../utils/cloud.js');
Page({data:{
  subCategories:[],activeSubCategory:'all',
  allStyles:[],displayList:[],leftList:[],rightList:[],
  isSearchMode:false,searchKeyword:''
},
async onLoad(options){
  if(options.subCategory)this.setData({activeSubCategory:options.subCategory});
  await this.initData();
},
onShow(){this.refreshFavorites();},
async initData(){
  wx.showLoading({title:'加载中...'});
  try{this.setData({allStyles:await cloud.getStyles()});}
  catch(e){this.setData({allStyles:require('../../utils/data.js').nailStyles});}
  this.setData({subCategories:[
    {id:'all',name:'全部'},{id:'纯色',name:'纯色'},{id:'法式',name:'法式'},
    {id:'猫眼',name:'猫眼'},{id:'渐变',name:'渐变'},{id:'贴片',name:'贴片'},{id:'雕花',name:'雕花'}
  ]});
  this.refreshFavorites();this.applyFilter();wx.hideLoading();
},
onSubTap(e){const id=e.currentTarget.dataset.id;if(id===this.data.activeSubCategory)return;this.setData({activeSubCategory:id});this.applyFilter();},
onSearchFocus(){this.setData({isSearchMode:true});},
onSearchInput(e){this.setData({searchKeyword:e.detail.value.trim()});this.applyFilter();},
onClearSearch(){this.setData({isSearchMode:false,searchKeyword:''});this.applyFilter();},
applyFilter(){
  let list=[...this.data.allStyles];
  if(this.data.activeSubCategory&&this.data.activeSubCategory!=='all')
    list=list.filter(s=>s.subCategory===this.data.activeSubCategory);
  if(this.data.searchKeyword){
    const kw=this.data.searchKeyword.toLowerCase();
    list=list.filter(s=>s.name.toLowerCase().includes(kw)||(s.tags||[]).some(t=>t.includes(kw)));
  }
  const L=[],R=[];
  list.forEach((item,i)=>{(i%2===0?L:R).push(item)});
  this.setData({displayList:list,leftList:L,rightList:R});
},
refreshFavorites(){
  const u=this.data.allStyles.map(s=>({...s,isFavorited:app.isFavorite(s.id)}));
  this.setData({allStyles:u});this.applyFilter();
},
onToggleFavorite(e){
  app.toggleFavorite(e.currentTarget.dataset.id).then(f=>{this.refreshFavorites();wx.showToast({title:f?'已收藏':'已取消收藏',icon:'none',duration:1000});});
},
onStyleTap(e){wx.navigateTo({url:'/pages/gallery-detail/gallery-detail?id='+e.currentTarget.dataset.id});},
onPullDownRefresh(){this.initData().then(()=>wx.stopPullDownRefresh());},
onShareAppMessage(){return{title:'悦指间美甲',path:'/pages/gallery/gallery'};}
});