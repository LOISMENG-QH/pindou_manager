// pages/settings/settings.js
const app = getApp();

Page({
  data: {
    user: null,
    stats: {
      beadsCount: 0,
      patternsCount: 0,
      completedCount: 0,
      lowStockCount: 0
    },
    loading: true
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
    this.setData({ 
      loading: true,
      user: app.globalData.userInfo 
    });
    
    try {
      // 加载统计数据
      const [beads, patterns] = await Promise.all([
        app.request('/api/beads'),
        app.request('/api/patterns')
      ]);

      const stats = {
        beadsCount: beads.length,
        patternsCount: patterns.length,
        completedCount: patterns.filter(p => p.status === 'completed').length,
        lowStockCount: beads.filter(b => b.quantity <= b.alertThreshold).length
      };

      this.setData({ stats, loading: false });
    } catch (error) {
      this.setData({ loading: false });
      console.error('加载统计失败:', error);
    }
  },

  // 同步数据
  async syncData() {
    wx.showLoading({ title: '同步中...' });
    
    try {
      await this.loadData();
      wx.showToast({ title: '同步成功', icon: 'success' });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '同步失败',
        icon: 'none'
      });
    }
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
        }
      }
    });
  },

  // 查看 API 健康状态
  async checkHealth() {
    wx.showLoading({ title: '检查中...' });
    
    try {
      const health = await app.request('/health');
      wx.hideLoading();
      
      wx.showModal({
        title: 'API 状态',
        content: `状态: ${health.status}\n时间: ${new Date(health.timestamp).toLocaleString()}`,
        showCancel: false
      });
    } catch (error) {
      wx.hideLoading();
      wx.showModal({
        title: 'API 状态',
        content: 'API 连接失败，请检查网络或服务器',
        showCancel: false
      });
    }
  },

  // 关于
  showAbout() {
    wx.showModal({
      title: '关于拼豆豆',
      content: '拼豆豆管理系统\n版本: 1.0.0\n\n一个现代化的拼豆管理工具\n支持多设备云端同步\n\nGitHub: LOISMENG-QH/pindou_manager',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 清空缓存
  clearCache() {
    wx.showModal({
      title: '清空缓存',
      content: '确定要清空本地缓存吗？这不会影响云端数据。',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              wx.showToast({ title: '缓存已清空', icon: 'success' });
            }
          });
        }
      }
    });
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadData();
    wx.stopPullDownRefresh();
  }
});
