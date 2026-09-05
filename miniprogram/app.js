const { getToken, getUserInfo } = require('./utils/auth');

App({
  globalData: {
    userInfo: null,
    token: ''
  },

  onLaunch() {
    // 恢复登录态
    const token = getToken();
    if (token) {
      this.globalData.token = token;
    }
    const userInfo = getUserInfo();
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  }
});
