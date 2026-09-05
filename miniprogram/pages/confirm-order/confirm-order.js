const api = require('../../utils/request');
const { isLogin } = require('../../utils/auth');
const { formatPrice } = require('../../utils/util');

Page({
  data: {
    shopId: null,
    shop: null,
    goods: [],
    address: null,
    remark: '',
    goodsAmount: '0.00',
    deliveryFee: '0.00',
    totalPrice: '0.00',
    submitting: false,
    formatPrice
  },

  onLoad(options) {
    this.setData({ shopId: options.shopId });
    this.loadData();
  },

  async loadData() {
    try {
      const [shop, cartList, addresses] = await Promise.all([
        api.get('/shops/' + this.data.shopId),
        api.get('/cart'),
        api.get('/address')
      ]);

      const shopCart = (cartList.find((s) => s.shopId === Number(this.data.shopId)) || { goods: [] }).goods;
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0] || null;

      this.setData({
        shop,
        goods: shopCart,
        address: defaultAddr,
        deliveryFee: shop.delivery_fee.toFixed(2),
        goodsAmount: shopCart.reduce((sum, g) => sum + g.price * g.count, 0).toFixed(2)
      });
      this.calcTotal();
    } catch (e) {
      // 已统一 toast
    }
  },

  calcTotal() {
    const { goodsAmount, deliveryFee } = this.data;
    this.setData({
      totalPrice: (Number(goodsAmount) + Number(deliveryFee)).toFixed(2)
    });
  },

  onSelectAddress() {
    wx.navigateTo({
      url: '/pages/address/address?select=1',
      events: {
        selectAddress: (data) => {
          if (data && data.address) {
            this.setData({ address: data.address });
          }
        }
      }
    });
  },

  onAddAddress() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  async onSubmit() {
    if (this.data.submitting) return;
    if (!this.data.address) {
      wx.showToast({ title: '请先选择收货地址', icon: 'none' });
      return;
    }
    if (!this.data.goods.length) {
      wx.showToast({ title: '购物车为空，请先选餐', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      const result = await api.post('/orders', {
        shopId: Number(this.data.shopId),
        addressId: this.data.address.id,
        remark: this.data.remark,
        items: this.data.goods.map((g) => ({ goodsId: g.goodsId, count: g.count }))
      });

      wx.showToast({ title: '下单成功', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/order-detail/order-detail?id=' + result.orderId });
      }, 800);
    } catch (e) {
      // 已统一 toast
    } finally {
      this.setData({ submitting: false });
    }
  }
});
