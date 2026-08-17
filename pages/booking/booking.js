/**
 * 在线预约页 — 单选服务 → 选技师 → 选时间（三步流程）
 */

const app = getApp();
const cloud = require('../../utils/cloud.js');
const { generateId, formatDate, getUpcomingDays, getTimeSlots } = require('../../utils/util.js');

Page({
  data: {
    currentStep: 1,
    canNext: false,
    canSubmit: false,

    // Step 1: 服务项目（带选中状态）
    serviceCategories: [],
    selectedProject: null,

    // Step 2: 技师
    technicians: [],

    // Step 3: 时间
    dateList: [],
    timeSlots: [],
    selectedDate: null,
    selectedTimeSlot: '',
    selectedTechnician: null,

    remark: ''
  },

  onLoad() { this.initPage(); },

  onShow() {
    // 刷新服务项目（管理后台可能改过价格），initPage 内部会保留已选状态
    this.initPage();

    const items = app.globalData.cartItems;
    if (items && items.length > 0) {
      // 预选项目（从款式详情跳来）
      const p = items[0];
      this.markSelected(p.id);
      this.setData({ selectedProject: { id: p.id, name: p.name, price: p.price, duration: p.duration } });
      app.globalData.cartItems = [];
      this.updateCanNext();
    }
  },

  async initPage() {
    // 从数据层动态读取服务项目与技师（管理员改价/换头像后这里同步最新数据）
    const keepProjectId = this.data.selectedProject ? this.data.selectedProject.id : null;
    const keepTechId = this.data.selectedTechnician ? this.data.selectedTechnician.id : null;
    const [catsData, techsData] = await Promise.all([cloud.getServiceCategories(), cloud.getTechnicians()]);
    const cats = catsData.map(cat => ({
      ...cat,
      items: cat.items.map(item => ({ ...item, selected: item.id === keepProjectId }))
    }));

    const dateList = getUpcomingDays(7).map(d => ({ ...d, available: true }));
    dateList.forEach(d => { if (d.date.getDay() === 0) d.available = false; });

    // 恢复已选技师（用最新头像/位置数）；技师被停用或删除则清空选择
    const techs = techsData.filter(t => t.isAvailable);
    const selectedTechnician = keepTechId ? (techs.find(t => t.id === keepTechId) || null) : null;

    this.setData({
      serviceCategories: cats,
      technicians: techs,
      selectedTechnician,
      dateList
    });

    // 恢复已选项目（用最新价格/时长）
    if (keepProjectId) {
      let p = null;
      catsData.some(cat => { p = cat.items.find(i => i.id === keepProjectId); return !!p; });
      if (p) {
        this.setData({ selectedProject: { id: p.id, name: p.name, price: p.price, duration: p.duration } });
        // 时长可能变了，重算时段；之前选的时段仍可用则保留
        if (this.data.selectedDate) {
          const prevSlot = this.data.selectedTimeSlot;
          this.onSelectDate({ currentTarget: { dataset: { date: this.data.selectedDate } } });
          const still = this.data.timeSlots.find(s => s.timeSlot === prevSlot && s.available);
          if (prevSlot && still) this.setData({ selectedTimeSlot: prevSlot });
          this.updateCanSubmit();
        }
      } else {
        this.setData({ selectedProject: null });
      }
    }

    if (!this.data.selectedDate && dateList[0].available) {
      this.onSelectDate({ currentTarget: { dataset: { date: dateList[0] } } });
    }
    this.updateCanNext();
  },

  /** 单选项目 */
  onSelectProject(e) {
    const { project } = e.currentTarget.dataset;
    if (!project || !project.id) return;

    // 选中当前，取消其他所有
    this.markSelected(project.id);
    this.setData({
      selectedProject: { id: project.id, name: project.name, price: project.price, duration: project.duration }
    });
    this.updateCanNext();
  },

  /** 标记选中状态到 serviceCategories */
  markSelected(projectId) {
    const cats = this.data.serviceCategories.map(cat => ({
      ...cat,
      items: cat.items.map(item => ({ ...item, selected: item.id === projectId }))
    }));
    this.setData({ serviceCategories: cats });
  },

  onSelectTechnician(e) {
    const { tech } = e.currentTarget.dataset;
    this.setData({ selectedTechnician: this.data.selectedTechnician && this.data.selectedTechnician.id === tech.id ? null : tech });
    this.updateCanNext();
  },

  /** 计算某技师某日期的时段与剩余位置 */
  calcTimeSlots(date, duration) {
    const tech = this.data.selectedTechnician;
    return getTimeSlots(date, duration, app.globalData.bookings, {
      technicianId: tech ? tech.id : null,
      slotCount: tech ? (tech.slotCount || 3) : 3
    });
  },

  onSelectDate(e) {
    const item = e.currentTarget.dataset.date;
    if (!item || !item.available) return;
    // dataset 传输后 Date 会变字符串，用 dateStr 重建
    const date = new Date(item.dateStr);
    const dur = this.data.selectedProject ? this.data.selectedProject.duration : 60;
    this.setData({ selectedDate: { ...item, date }, timeSlots: this.calcTimeSlots(date, dur), selectedTimeSlot: '' });
    this.updateCanSubmit();
  },

  onSelectTimeSlot(e) {
    const { slot } = e.currentTarget.dataset;
    if (!slot.available) return;
    this.setData({ selectedTimeSlot: slot.timeSlot });
    this.updateCanSubmit();
  },

  onRemarkInput(e) { this.setData({ remark: e.detail.value }); },

  updateCanNext() {
    if (this.data.currentStep === 1) this.setData({ canNext: !!this.data.selectedProject });
    else if (this.data.currentStep === 2) this.setData({ canNext: !!this.data.selectedTechnician });
  },

  updateCanSubmit() {
    this.setData({ canSubmit: !!this.data.selectedDate && !!this.data.selectedTimeSlot });
  },

  onNextStep() {
    if (!this.data.canNext) return;
    const next = this.data.currentStep + 1;
    this.setData({ currentStep: next });
    if (next === 3 && this.data.selectedDate) {
      const dur = this.data.selectedProject ? this.data.selectedProject.duration : 60;
      this.setData({ timeSlots: this.calcTimeSlots(this.data.selectedDate.date, dur), selectedTimeSlot: '' });
      this.updateCanSubmit();
    }
    if (next === 2) this.updateCanNext();
  },

  onPrevStep() {
    this.setData({ currentStep: this.data.currentStep - 1 });
    this.updateCanNext();
  },

  onSubmit() {
    if (!this.data.canSubmit) return;
    const { selectedProject, selectedTechnician, selectedDate, selectedTimeSlot, remark } = this.data;

    const booking = {
      id: generateId('BK'),
      userId: 'user_001',
      projects: [selectedProject],
      projectNames: selectedProject.name,
      technicianId: selectedTechnician.id,
      technicianName: selectedTechnician.name,
      technicianAvatar: selectedTechnician.avatar,
      date: selectedDate.dateStr,
      timeSlot: selectedTimeSlot,
      totalAmount: selectedProject.price,
      totalDuration: selectedProject.duration,
      remark: (remark || '').slice(0, 200),
      status: 'pending',
      createTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm')
    };

    wx.showModal({
      title: '确认预约',
      content: `项目：${booking.projectNames}\n技师：${booking.technicianName}\n时间：${booking.date} ${booking.timeSlot}\n金额：¥${booking.totalAmount}`,
      confirmText: '确认提交',
      cancelText: '再想想',
      confirmColor: '#D4A0A0',
      success: (res) => {
        if (res.confirm) {
          app.addBooking(booking);
          wx.navigateTo({ url: `/pages/booking-success/booking-success?id=${booking.id}` });
        }
      }
    });
  },

  onShareAppMessage() {
    return { title: '悦指间美甲 — 在线预约', path: '/pages/booking/booking' };
  }
});
