// pages/patterns/patterns.js
const app = getApp();

Page({
  data: {
    patterns: [],
    beads: [],
    loading: true,
    activeTab: 'planned', // 'planned' 或 'completed'
    showAddModal: false,
    showDetailModal: false,
    selectedPattern: null,
    
    // 表单数据
    formData: {
      name: '',
      description: '',
      imageUrl: '',
      thumbnailUrl: ''
    }
  },

  onLoad() {
    this.checkAuth();
  },

  onShow() {
    if (app.globalData.token) {
      this.loadData();
    }
  },

  // 检查登录状态
  checkAuth() {
    if (!app.globalData.token) {
      wx.reLaunch({ url: '/pages/auth/auth' });
      return;
    }
    this.loadData();
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });
    
    try {
      const [patterns, beads] = await Promise.all([
        app.request('/api/patterns'),
        app.request('/api/beads')
      ]);
      
      this.setData({ 
        patterns,
        beads,
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

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 获取过滤后的图纸
  getFilteredPatterns() {
    const { patterns, activeTab } = this.data;
    return patterns.filter(p => p.status === activeTab);
  },

  // 选择图片
  async chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        wx.showLoading({ title: '处理图片中...' });
        
        try {
          // 转换为 base64
          const base64 = await this.imageToBase64(tempFilePath);
          
          // 生成缩略图
          const thumbnail = await this.createThumbnail(tempFilePath);
          
          this.setData({
            'formData.imageUrl': base64,
            'formData.thumbnailUrl': thumbnail
          });
          
          wx.hideLoading();
          wx.showToast({ title: '图片已选择', icon: 'success' });
        } catch (error) {
          wx.hideLoading();
          wx.showToast({
            title: '图片处理失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 图片转 base64
  imageToBase64(filePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath,
        encoding: 'base64',
        success: (res) => {
          resolve(`data:image/jpeg;base64,${res.data}`);
        },
        fail: reject
      });
    });
  },

  // 创建缩略图
  async createThumbnail(filePath) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: filePath,
        success: (info) => {
          // 计算缩略图尺寸
          const maxSize = 200;
          let width = info.width;
          let height = info.height;
          
          if (width > height && width > maxSize) {
            height = height * (maxSize / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = width * (maxSize / height);
            height = maxSize;
          }

          // 创建画布
          const ctx = wx.createCanvasContext('thumbnailCanvas', this);
          ctx.drawImage(filePath, 0, 0, width, height);
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              canvasId: 'thumbnailCanvas',
              width,
              height,
              success: async (res) => {
                const base64 = await this.imageToBase64(res.tempFilePath);
                resolve(base64);
              },
              fail: reject
            }, this);
          });
        },
        fail: reject
      });
    });
  },

  // 显示添加弹窗
  showAddPattern() {
    this.setData({
      showAddModal: true,
      formData: {
        name: '',
        description: '',
        imageUrl: '',
        thumbnailUrl: ''
      }
    });
  },

  // 关闭添加弹窗
  closeAddModal() {
    this.setData({ showAddModal: false });
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  // 提交表单
  async submitForm() {
    const { formData } = this.data;
    
    if (!formData.name) {
      wx.showToast({ title: '请输入图纸名称', icon: 'none' });
      return;
    }

    if (!formData.imageUrl) {
      wx.showToast({ title: '请选择图片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '上传中...' });

    try {
      await app.request('/api/patterns', {
        method: 'POST',
        data: {
          ...formData,
          status: 'planned'
        }
      });

      wx.showToast({ title: '添加成功', icon: 'success' });
      this.closeAddModal();
      this.loadData();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '添加失败',
        icon: 'none'
      });
    }
  },

  // 查看详情
  showDetail(e) {
    const pattern = e.currentTarget.dataset.pattern;
    this.setData({
      showDetailModal: true,
      selectedPattern: pattern
    });
  },

  // 关闭详情
  closeDetailModal() {
    this.setData({ showDetailModal: false });
  },

  // 标记完成
  async markCompleted(e) {
    const pattern = e.currentTarget.dataset.pattern;
    
    wx.showModal({
      title: '标记为已完成',
      content: '确定已完成这个图纸吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            await app.request(`/api/patterns/${pattern.id}`, {
              method: 'PUT',
              data: { status: 'completed' }
            });
            wx.showToast({ title: '已标记完成', icon: 'success' });
            this.loadData();
          } catch (error) {
            wx.hideLoading();
            wx.showToast({
              title: error.message || '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 删除图纸
  deletePattern(e) {
    const pattern = e.currentTarget.dataset.pattern;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${pattern.name} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          try {
            await app.request(`/api/patterns/${pattern.id}`, {
              method: 'DELETE'
            });
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadData();
            this.closeDetailModal();
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

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    
    // 由于是 base64，需要先保存为临时文件
    const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
    const filePath = `${wx.env.USER_DATA_PATH}/preview_${Date.now()}.jpg`;
    
    wx.getFileSystemManager().writeFile({
      filePath,
      data: base64Data,
      encoding: 'base64',
      success: () => {
        wx.previewImage({
          urls: [filePath],
          current: filePath
        });
      }
    });
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadData();
    wx.stopPullDownRefresh();
  }
});
