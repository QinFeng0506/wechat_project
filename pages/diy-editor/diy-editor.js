/** DIY编辑页 */
const app=getApp();
const cloud=require('../../utils/cloud.js');
const palettes={
  '红色系':['#FF6B6B','#E85D75','#D94A5A','#FF8A80','#FFB3B3','#FFCDD2','#F48FB1','#E57373','#EF5350','#F44336'],
  '粉色系':['#FFB5C2','#F8BBD0','#F48FB1','#FF80AB','#FF4081','#FCE4EC','#FFE0E8','#FFD0DA','#FFB0C0','#E8A0B4'],
  '裸色系':['#DEB8A0','#D4A0A0','#C4A882','#D7C4B8','#E8D5C8','#F5E6D8','#FFE0D0','#E0C8B0','#D0B8A0','#C8A890'],
  '蓝色系':['#B0C4DE','#A8C8E8','#90B8D8','#80A8C8','#B8D4E8','#C8E0F0','#A0C0D8','#88A8C0','#78A0B8','#98B8D0'],
  '绿色系':['#A8C4A2','#B8D8B0','#C0E0C0','#A0C8A0','#90B890','#88B080','#B0D0B0','#C8E8C0','#D0F0C8','#98C898'],
  '深色系':['#6B3A5B','#8B4A6B','#5C3D5C','#7B5060','#4A2C3A','#9B6A7B','#3D2A3D','#6B4A5B','#8B5A6B','#5B3A4B'],
  '闪粉':['#FFD700','#FFC0CB','#E0BBE4','#FFDFC0','#FFE8D0','#FFF0E0','#FFD8E0','#FFE0FF','#E0D0FF','#FFE0C0']
};
Page({data:{
  skinTone:0,skinColors:[{bg:'#FFDCC8'},{bg:'#F0C8B0'},{bg:'#D4A88C'},{bg:'#B89074'}],
  fingers:[0,1,2,3,4],nails:['#FFE0E0','#FFE0E0','#FFE0E0','#FFE0E0','#FFE0E0'],
  selectedFinger:0,colorTabs:Object.keys(palettes),colorTab:0,currentPalette:palettes['红色系']
},onLoad(){
  const tp=app.globalData.diyTemplate;if(tp){this.setData({nails:[...tp.nails]});app.globalData.diyTemplate=null;}
},
onSelectFinger(e){this.setData({selectedFinger:e.currentTarget.dataset.index});},
onSkinTone(e){this.setData({skinTone:e.currentTarget.dataset.i});},
onColorTab(e){const i=e.currentTarget.dataset.i;this.setData({colorTab:i,currentPalette:palettes[Object.keys(palettes)[i]]});},
onPickColor(e){const c=e.currentTarget.dataset.color,idx=this.data.selectedFinger,n=[...this.data.nails];n[idx]=c;this.setData({nails:n});},
onAllSame(){const c=this.data.nails[this.data.selectedFinger];this.setData({nails:[c,c,c,c,c]});},
onReset(){this.setData({nails:['#FFE0E0','#FFE0E0','#FFE0E0','#FFE0E0','#FFE0E0']});},
async onSave(){
  const res=await new Promise(r=>{wx.showModal({title:'保存作品',content:'给作品起个名字吧～',editable:true,placeholderText:'我的DIY美甲',confirmColor:'#D4A0A0',success:r});});
  if(!res.confirm)return;const name=res.content||'我的DIY美甲';
  await cloud.saveDiyWork({name,previewImage:'/images/diy/hand1.png',config:{skinTone:this.data.skinTone,nails:this.data.nails}});
  wx.showToast({title:'已保存!',icon:'success'});setTimeout(()=>wx.navigateBack(),1200);
},
onBook(){wx.switchTab({url:'/pages/booking/booking'});wx.showToast({title:'DIY配置已保存，预约时可备注',icon:'none'});}
});