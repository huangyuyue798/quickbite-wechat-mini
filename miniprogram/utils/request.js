// 网络请求封装
// 开发环境地址：真机调试请改为电脑局域网 IP，如 http://192.168.1.100:3000/api
const BASE_URL = 'http://localhost:3000/api';

function request(method, url, data = {}, needAuth = true) {
  return new Promise((resolve, reject) => {
    const header = { 'Content-Type': 'application/json' };
    const token = wx.getStorageSync('token');
    if (needAuth && token) {
      header.Authorization = 'Bearer ' + token;
    }

    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      success(res) {
        // 登录失效统一处理
        if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.showToast({ title: '请先登录', icon: 'none' });
          setTimeout(() => {
            wx.navigateTo({ url: '/pages/login/login' });
          }, 800);
          reject(res.data);
          return;
        }
        if (res.data && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          wx.showToast({
            title: (res.data && res.data.message) || '请求失败',
            icon: 'none'
          });
          reject(res.data);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误，请检查后端服务', icon: 'none' });
        reject(err);
      }
    });
  });
}

module.exports = {
  BASE_URL,
  get: (url, data, needAuth = true) => request('GET', url, data, needAuth),
  post: (url, data, needAuth = true) => request('POST', url, data, needAuth),
  put: (url, data, needAuth = true) => request('PUT', url, data, needAuth),
  del: (url, data, needAuth = true) => request('DELETE', url, data, needAuth)
};
