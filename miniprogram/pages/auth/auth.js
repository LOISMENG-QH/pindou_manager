// pages/auth/auth.js
const app = getApp();

Page({
  data: {
    mode: 'login', // 'login' 或 'register'
    email: '',
    password: '',
    username: '',
    loading: false,
    error: ''
  },

  onLoad() {
    // 如果已登录，跳转到主页
    if (app.globalData.token) {
      wx.switchTab({ url: '/pages/beads/beads' });
    }
  },

  // 切换登录/注册模式
  switchMode() {
    this.setData({
      mode: this.data.mode === 'login' ? 'register' : 'login',
      error: ''
    });
  },

  // 输入处理
  onEmailInput(e) {
    this.setData({ email: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  // 提交表单
  async handleSubmit() {
    const { mode, email, password, username } = this.data;

    // 验证
    if (!email || !password) {
      this.setData({ error: '请填写邮箱和密码' });
      return;
    }

    if (mode === 'register' && !username) {
      this.setData({ error: '请填写用户名' });
      return;
    }

    if (password.length < 6) {
      this.setData({ error: '密码至少 6 位' });
      return;
    }

    this.setData({ loading: true, error: '' });

    try {
      if (mode === 'register') {
        await app.register(email, password, username);
      } else {
        await app.login(email, password);
      }

      wx.showToast({
        title: mode === 'login' ? '登录成功' : '注册成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.switchTab({ url: '/pages/beads/beads' });
      }, 1000);

    } catch (error) {
      this.setData({
        error: error.message || '操作失败，请重试',
        loading: false
      });
    }
  }
});
