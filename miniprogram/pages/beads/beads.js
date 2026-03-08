// pages/beads/beads.js
const app = getApp();

Page({
  data: {
    beads: [],
    loading: true,
    showAddModal: false,
    editingBead: null,
    searchTerm: '',
    
    // 表单数据
    formData: {
      colorCode: '',
      colorName: '',
      quantity: 0,
      alertThreshold: 10
    },

    // 预设色号（部分常用色号）
    presetColors: [
      { code: 'A1', name: '淡黄', hex: '#FFF9C4' },
      { code: 'A2', name: '浅黄', hex: '#FFF59D' },
      { code: 'B1', name: '浅粉', hex: '#F8BBD0' },
      { code: 'B2', name: '粉红', hex: '#F48FB1' },
      { code: 'C1', name: '浅蓝', hex: '#BBDEFB' },
      { code: 'C2', name: '天蓝', hex: '#90CAF9' },
      { code: 'D1', name: '浅绿', hex: '#C8E6C9' },
      { code: 'D2', name: '绿色', hex: '#A5D6A7' },
      { code: 'F7', name: '黑色', hex: '#212121' },
      { code: 'H1', name: '白色', hex: '#FFFFFF' }
    ]
  },

  onLoad() {
    this.checkAuth();
  },

  onShow() {
    if (app.globalData.token) {
      this.loadBeads();
    }
  },

  // 检查登录状态
  checkAuth() {
    if (!app.globalData.token) {
      wx.reLaunch({ url: '/pages/auth/auth' });
      return;
    }
    this.loadBeads();
  },

  // 加载豆子列表
  async loadBeads() {
    this.setData({ loading: true });
    
    try {
      const beads = await app.request('/api/beads');
      this.setData({ 
        beads: this.sortBeads(beads),
        loading: false 
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  // 排序豆子（按色号）
  sortBeads(beads) {
    return beads.sort((a, b) => {
      const aLetter = a.colorCode.replace(/[0-9]/g, '');
      const bLetter = b.colorCode.replace(/[0-9]/g, '');
      const aNumber = parseInt(a.colorCode.replace(/[^0-9]/g, ''));
      const bNumber = parseInt(b.colorCode.replace(/[^0-9]/g, ''));
      
      if (aLetter !== bLetter) {
        return aLetter.localeCompare(bLetter);
      }
      return aNumber - bNumber;
    });
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ searchTerm: e.detail.value });
  },

  // 获取过滤后的豆子列表
  getFilteredBeads() {
    const { beads, searchTerm } = this.data;
    if (!searchTerm) return beads;
    
    const term = searchTerm.toLowerCase();
    return beads.filter(bead => 
      bead.colorCode.toLowerCase().includes(term) ||
      bead.colorName.toLowerCase().includes(term)
    );
  },

  // 显示添加弹窗
  showAddBead() {
    this.setData({
      showAddModal: true,
      editingBead: null,
      formData: {
        colorCode: '',
        colorName: '',
        quantity: 0,
        alertThreshold: 10
      }
    });
  },

  // 显示编辑弹窗
  showEditBead(e) {
    const bead = e.currentTarget.dataset.bead;
    this.setData({
      showAddModal: true,
      editingBead: bead,
      formData: {
        colorCode: bead.colorCode,
        colorName: bead.colorName,
        quantity: bead.quantity,
        alertThreshold: bead.alertThreshold
      }
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showAddModal: false });
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  // 选择预设色号
  selectPresetColor(e) {
    const { code, name } = e.currentTarget.dataset;
    this.setData({
      'formData.colorCode': code,
      'formData.colorName': name
    });
  },

  // 提交表单
  async submitForm() {
    const { formData, editingBead } = this.data;
    
    // 验证
    if (!formData.colorCode || !formData.colorName) {
      wx.showToast({ title: '请填写色号和名称', icon: 'none' });
      return;
    }

    wx.showLoading({ title: editingBead ? '保存中...' : '添加中...' });

    try {
      if (editingBead) {
        // 更新
        await app.request(`/api/beads/${editingBead.id}`, {
          method: 'PUT',
          data: formData
        });
        wx.showToast({ title: '保存成功', icon: 'success' });
      } else {
        // 添加
        await app.request('/api/beads', {
          method: 'POST',
          data: {
            ...formData,
            quantity: parseInt(formData.quantity) || 0,
            alertThreshold: parseInt(formData.alertThreshold) || 10
          }
        });
        wx.showToast({ title: '添加成功', icon: 'success' });
      }

      this.closeModal();
      this.loadBeads();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
  },

  // 快速调整数量
  async adjustQuantity(e) {
    const { bead, change } = e.currentTarget.dataset;
    const newQuantity = Math.max(0, bead.quantity + change);

    try {
      await app.request(`/api/beads/${bead.id}`, {
        method: 'PUT',
        data: { quantity: newQuantity }
      });
      
      // 本地更新
      const beads = this.data.beads.map(b => 
        b.id === bead.id ? { ...b, quantity: newQuantity } : b
      );
      this.setData({ beads });
    } catch (error) {
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
  },

  // 删除豆子
  deleteBead(e) {
    const bead = e.currentTarget.dataset.bead;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${bead.colorCode} ${bead.colorName} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          try {
            await app.request(`/api/beads/${bead.id}`, {
              method: 'DELETE'
            });
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadBeads();
          } catch (error) {
            wx.hideLoading();
            wx.showToast({
              title: error.message || '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadBeads();
    wx.stopPullDownRefresh();
  }
});
