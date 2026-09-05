const api = require('../../utils/request');
const { formatPrice, formatTime } = require('../../utils/util');

Page({
  data: {
    orderId: null,
    order: null,
    loading: true,
    formatPrice,
    formatTime
  },

  onLoad(options) {
    this.setData({ orderId: options.id });
  },

  onShow() {
    if (this.data.orderId) {
      this.loadOrder();
    }
  },

  async loadOrder() {
    this.setData({ loading: true });
    try {
      const order = await api.get('/orders/' + this.data.orderId);
      this.setData({ order });
    } catch (e) {
      // 已统一 toast
    } finally {
      this.setData({ loading: false });
    }
  },

  // 支付（开发环境模拟直接成功）
  onPay() {
    wx.showModal({
      title: '模拟支付',
      content: `确认支付 ¥${this.data.order.total_price} 吗？`,
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.put('/orders/' + this.data.orderId + '/pay');
          wx.showToast({ title: '支付成功', icon: 'success' });
          this.loadOrder();
        } catch (e) {
          // 已统一 toast
        }
      }
    });
  },

  onCancel() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.put('/orders/' + this.data.orderId + '/cancel');
          wx.showToast({ title: '已取消', icon: 'success' });
          this.loadOrder();
        } catch (e) {
          // 已统一 toast
        }
      }
    });
  },

  onConfirm() {
    wx.showModal({
      title: '确认收货',
      content: '确认已经收到餐品了吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.put('/orders/' + this.data.orderId + '/confirm');
          wx.showToast({ title: '已确认收货', icon: 'success' });
          this.loadOrder();
        } catch (e) {
          // 已统一 toast
        }
      }
    });
  },

  goShop() {
    if (!this.data.order) return;
    wx.navigateTo({ url: '/pages/shop/shop?id=' + this.data.order.shop_id });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
