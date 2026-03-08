// app.js
const API_BASE_URL = 'http://你的服务器IP:3000'; // 修改为你的后端地址

App({
  globalData: {
    userInfo: null,
    token: null,
    apiBaseUrl: API_BASE_URL
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      this.checkAuth();
    }
  },

  // 检查认证状态
  async checkAuth() {
    try {
      const res = await this.request('/api/auth/me');
      this.globalData.userInfo = res;
    } catch (error) {
      console.error('认证失败:', error);
      wx.removeStorageSync('token');
      this.globalData.token = null;
      wx.reLaunch({ url: '/pages/auth/auth' });
    }
  },

  // 封装请求
  request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const { method = 'GET', data = {} } = options;
      const header = {
        'Content-Type': 'application/json',
      };

      if (this.globalData.token) {
        header.Authorization = `Bearer ${this.globalData.token}`;
      }

      wx.request({
        url: this.globalData.apiBaseUrl + url,
        method,
        data,
        header,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.error || '请求失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 登录
  async login(email, password) {
    try {
      const res = await this.request('/api/auth/login', {
        method: 'POST',
        data: { email, password }
      });
      this.globalData.token = res.token;
      this.globalData.userInfo = res.user;
      wx.setStorageSync('token', res.token);
      return res;
    } catch (error) {
      throw error;
    }
  },

  // 注册
  async register(email, password, username) {
    try {
      const res = await this.request('/api/auth/register', {
        method: 'POST',
        data: { email, password, username }
      });
      this.globalData.token = res.token;
      this.globalData.userInfo = res.user;
      wx.setStorageSync('token', res.token);
      return res;
    } catch (error) {
      throw error;
    }
  },

  // 登出
  logout() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    wx.removeStorageSync('token');
    wx.reLaunch({ url: '/pages/auth/auth' });
  }
});
