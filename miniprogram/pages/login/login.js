const api = require('../../utils/request');
const { setToken, setUserInfo } = require('../../utils/auth');

Page({
  data: {
    loading: false
  },

  // 真实环境：微信一键登录
  onWechatLogin() {
    if (this.data.loading) return;
    wx.login({
      success: (res) => {
        if (res.code) {
          this.doLogin(res.code);
        } else {
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      }
    });
  },

  // 开发环境：模拟登录（无 AppID 时使用）
  onDevLogin() {
    this.doLogin('dev_code_' + Date.now());
  },

  async doLogin(code) {
    this.setData({ loading: true });
    wx.showLoading({ title: '登录中...' });
    try {
      const { token, userInfo } = await api.post('/auth/login', { code }, false);
      setToken(token);
      setUserInfo(userInfo);
      wx.hideLoading();
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 600);
    } catch (e) {
      wx.hideLoading();
    } finally {
      this.setData({ loading: false });
    }
  }
});
