const api = require('../../utils/request');
const { isLogin } = require('../../utils/auth');
const { formatPrice, formatTime } = require('../../utils/util');

Page({
  data: {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待付款' },
      { key: 'paid', label: '待接单' },
      { key: 'delivering', label: '配送中' },
      { key: 'completed', label: '已完成' }
    ],
    activeTab: 'all',
    orders: [],
    loading: false,
    loggedIn: false,
    formatPrice,
    formatTime
  },

  onShow() {
    if (!isLogin()) {
      this.setData({ loggedIn: false, orders: [] });
      return;
    }
    this.setData({ loggedIn: true });
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders().finally(() => wx.stopPullDownRefresh());
  },

  onTabTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeTab) return;
    this.setData({ activeTab: key }, () => this.loadOrders());
  },

  async loadOrders() {
    this.setData({ loading: true });
    try {
      const orders = await api.get('/orders', { status: this.data.activeTab });
      this.setData({ orders });
    } catch (e) {
      // 已统一 toast
    } finally {
      this.setData({ loading: false });
    }
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + e.currentTarget.dataset.id });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
