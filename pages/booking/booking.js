/**
 * 在线预约页 — 多步骤选择流程
 */

const app = getApp();
const { serviceCategories, technicians: techData } = require('../../utils/data.js');
const { generateId, formatDate, getUpcomingDays, getTimeSlots } = require('../../utils/util.js');

Page({
  data: {
    /** 步骤控制 */
    currentStep: 1,
    canNext: false,
    canSubmit: false,

    /** Step 1: 服务项目 */
    serviceCategories: [],
    selectedProjects: [],
    totalAmount: 0,
    totalDuration: 0,

    /** Step 2: 技师 */
    technicians: [],

    /** Step 3: 时间 */
    dateList: [],
    timeSlots: [],
    selectedDate: null,
    selectedTimeSlot: '',
    selectedTechnician: null,

    /** 备注 */
    remark: '',

    /** 文本拼接 */
    selectedProjectsText: '',

    /** WXML 工具函数 */
    utils: {
      isSelected: (arr, id) => arr.some(item => item.id === id)
    }
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    // 检查是否有预选款式（从款式详情跳转过来）
    const cartItems = app.globalData.cartItems;
    if (cartItems && cartItems.length > 0) {
      this.setData({
        selectedProjects: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          duration: item.duration
        }))
      });
      this.calcTotal();

      // 清除全局暂存
      app.globalData.cartItems = [];
    }
  },

  /**
   * 初始化页面
   */
  initPage() {
    const today = new Date();
    const dateList = getUpcomingDays(7).map(d => ({
      ...d,
      available: true // 模拟全部可用
    }));

    // 模拟周末不可约
    dateList.forEach(d => {
      const day = d.date.getDay();
      if (day === 0) d.available = false;
    });

    this.setData({
      serviceCategories,
      technicians: techData.filter(t => t.isAvailable),
      dateList
    });

    // 默认选今天
    if (dateList[0].available) {
      this.onSelectDate({ currentTarget: { dataset: { date: dateList[0] } } });
    }
  },

  /**
   * 选择/取消项目 (Step 1)
   */
  onToggleProject(e) {
    const { project } = e.currentTarget.dataset;

    if (!project || !project.id) return;

    const selected = [...this.data.selectedProjects];
    const index = selected.findIndex(item => item.id === project.id);

    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push({
        id: project.id,
        name: project.name,
        price: project.price,
        duration: project.duration
      });
    }

    this.setData({ selectedProjects: selected });
    this.calcTotal();
    this.updateCanNext();
  },

  /**
   * 计算总价和总时长
   */
  calcTotal() {
    const { selectedProjects } = this.data;
    const totalAmount = selectedProjects.reduce((sum, item) => sum + item.price, 0);
    const totalDuration = selectedProjects.reduce((sum, item) => sum + item.duration, 0);
    const selectedProjectsText = selectedProjects.map(item => item.name).join('、');

    this.setData({
      totalAmount,
      totalDuration,
      selectedProjectsText
    });
  },

  /**
   * 选择技师 (Step 2)
   */
  onSelectTechnician(e) {
    const { tech } = e.currentTarget.dataset;
    this.setData({
      selectedTechnician: tech
    });
    this.updateCanNext();
  },

  /**
   * 选择日期 (Step 3)
   */
  onSelectDate(e) {
    const { date } = e.currentTarget.dataset;
    if (!date.available) return;

    const timeSlots = getTimeSlots(date.date, this.data.totalDuration);

    this.setData({
      selectedDate: date,
      timeSlots,
      selectedTimeSlot: ''
    });
    this.updateCanSubmit();
  },

  /**
   * 选择时段 (Step 3)
   */
  onSelectTimeSlot(e) {
    const { slot } = e.currentTarget.dataset;
    if (!slot.available) return;

    this.setData({
      selectedTimeSlot: slot.timeSlot
    });
    this.updateCanSubmit();
  },

  /**
   * 备注输入
   */
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  /**
   * 检查 Step 1 是否可以下一步
   */
  updateCanNext() {
    const { currentStep, selectedProjects, selectedTechnician } = this.data;

    if (currentStep === 1) {
      this.setData({ canNext: selectedProjects.length > 0 });
    } else if (currentStep === 2) {
      this.setData({ canNext: !!selectedTechnician });
    }
  },

  /**
   * 检查 Step 3 是否可以提交
   */
  updateCanSubmit() {
    const { selectedDate, selectedTimeSlot } = this.data;
    this.setData({
      canSubmit: !!selectedDate && !!selectedTimeSlot
    });
  },

  /**
   * 下一步
   */
  onNextStep() {
    if (!this.data.canNext) return;

    const nextStep = this.data.currentStep + 1;
    this.setData({ currentStep: nextStep });

    // 切换到 Step 3 时重新生成可用时段
    if (nextStep === 3 && this.data.selectedDate) {
      const timeSlots = getTimeSlots(this.data.selectedDate.date, this.data.totalDuration);
      this.setData({ timeSlots, selectedTimeSlot: '' });
      this.updateCanSubmit();
    }

    if (nextStep === 2) {
      this.updateCanNext();
    }
  },

  /**
   * 上一步
   */
  onPrevStep() {
    const prevStep = this.data.currentStep - 1;
    this.setData({ currentStep: prevStep });
    this.updateCanNext();
  },

  /**
   * 提交预约
   */
  onSubmit() {
    if (!this.data.canSubmit) return;

    const { selectedProjects, selectedTechnician, selectedDate,
            selectedTimeSlot, totalAmount, totalDuration, remark } = this.data;

    // 构造预约数据
    const booking = {
      id: generateId('BK'),
      userId: 'user_001',
      projects: selectedProjects,
      projectNames: selectedProjects.map(p => p.name).join('、'),
      technicianId: selectedTechnician.id,
      technicianName: selectedTechnician.name,
      technicianAvatar: selectedTechnician.avatar,
      date: selectedDate.dateStr,
      timeSlot: selectedTimeSlot,
      totalAmount,
      totalDuration,
      remark,
      status: 'pending',
      createTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm')
    };

    wx.showModal({
      title: '确认预约',
      content: `预约项目：${booking.projectNames}\n技师：${booking.technicianName}\n时间：${booking.date} ${booking.timeSlot}\n金额：¥${booking.totalAmount}`,
      confirmText: '确认提交',
      cancelText: '再想想',
      confirmColor: '#D4A0A0',
      success: (res) => {
        if (res.confirm) {
          app.addBooking(booking);
          wx.navigateTo({
            url: `/pages/booking-success/booking-success?id=${booking.id}`
          });
        }
      }
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '悦指间美甲 — 在线预约',
      path: '/pages/booking/booking'
    };
  }
});
