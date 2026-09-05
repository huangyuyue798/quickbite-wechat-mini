const { getUserInfo, isLogin, clearToken, clearUserInfo } = require('../../utils/auth');

Page({
  data: {
    userInfo: null,
    loggedIn: false
  },

  onShow() {
    const loggedIn = isLogin();
    this.setData({
      loggedIn,
      userInfo: loggedIn ? getUserInfo() : null
    });
  },

  onUserTap() {
    if (!this.data.loggedIn) {
      wx.navigateTo({ url: '/pages/login/login' });
    }
  },

  goOrders() {
    wx.switchTab({ url: '/pages/order/order' });
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/address' });
  },

  goIndex() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  showAbout() {
    wx.showModal({
      title: '关于 QuickBite',
      content: '基于微信小程序 + Node.js(Express) + MySQL 的外卖点餐系统，大一全栈练手项目。\n\nGitHub: huangyuyue798/quickbite-wechat-mini',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (!res.confirm) return;
        clearToken();
        clearUserInfo();
        this.setData({ loggedIn: false, userInfo: null });
        wx.showToast({ title: '已退出登录', icon: 'none' });
      }
    });
  }
});
