// 登录态管理
const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';

function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || '';
}

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

function clearToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

function getUserInfo() {
  return wx.getStorageSync(USER_INFO_KEY) || null;
}

function setUserInfo(userInfo) {
  wx.setStorageSync(USER_INFO_KEY, userInfo);
}

function clearUserInfo() {
  wx.removeStorageSync(USER_INFO_KEY);
}

function isLogin() {
  return !!getToken();
}

module.exports = {
  getToken,
  setToken,
  clearToken,
  getUserInfo,
  setUserInfo,
  clearUserInfo,
  isLogin
};
