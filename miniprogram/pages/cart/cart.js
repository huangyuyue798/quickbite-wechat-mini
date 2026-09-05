const api = require('../../utils/request');
const { isLogin } = require('../../utils/auth');

Page({
  data: {
    cartGroups: [],
    loading: false,
    loggedIn: false
  },

  onShow() {
    if (!isLogin()) {
      this.setData({ loggedIn: false, cartGroups: [] });
      return;
    }
    this.setData({ loggedIn: true });
    this.loadCart();
  },

  async loadCart() {
    this.setData({ loading: true });
    try {
      const list = await api.get('/cart');
      const cartGroups = list.map((shop) => ({
        ...shop,
        goodsAmount: shop.goodsAmount.toFixed(2)
      }));
      this.setData({ cartGroups });
    } catch (e) {
      // 已统一 toast
    } finally {
      this.setData({ loading: false });
    }
  },

  async onChange(e) {
    const { cart, group } = e.currentTarget.dataset;
    const newCount = e.detail.count;
    try {
      if (newCount <= 0) {
        await api.del('/cart/' + cart.cartId);
      } else {
        await api.put('/cart/' + cart.cartId, { count: newCount });
      }
      await this.loadCart();
    } catch (err) {
      // 已统一 toast
    }
  },

  clearAll() {
    wx.showModal({
      title: '提示',
      content: '确定要清空购物车吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.del('/cart');
          this.setData({ cartGroups: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        } catch (e) {
          // 已统一 toast
        }
      }
    });
  },

  goShop(e) {
    wx.navigateTo({ url: '/pages/shop/shop?id=' + e.currentTarget.dataset.id });
  },

  checkout(e) {
    const shopId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/confirm-order/confirm-order?shopId=' + shopId });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
