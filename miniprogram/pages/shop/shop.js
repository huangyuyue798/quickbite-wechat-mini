const api = require('../../utils/request');
const { isLogin } = require('../../utils/auth');

Page({
  data: {
    shopId: null,
    shop: null,
    categories: [],
    activeCatId: 0,
    allGoods: [],
    goods: [],
    cartMap: {}, // goodsId -> count，用于商品卡片显示数量
    cartList: [], // 本店购物车明细
    totalCount: 0,
    totalPrice: '0.00',
    showCartPanel: false
  },

  onLoad(options) {
    this.setData({ shopId: options.id });
    this.loadShop();
    this.loadGoods();
  },

  onShow() {
    if (this.data.shopId && isLogin()) {
      this.refreshCart();
    }
  },

  async loadShop() {
    try {
      const shop = await api.get('/shops/' + this.data.shopId);
      wx.setNavigationBarTitle({ title: shop.name });
      this.setData({ shop });
    } catch (e) {
      // 已统一 toast
    }
  },

  async loadGoods() {
    try {
      const { categories, goods } = await api.get('/shops/' + this.data.shopId + '/goods');
      this.setData({
        categories,
        allGoods: goods,
        activeCatId: categories.length ? categories[0].id : 0
      });
      this.filterGoods();
    } catch (e) {
      // 已统一 toast
    }
  },

  filterGoods() {
    const { allGoods, activeCatId } = this.data;
    const goods = activeCatId ? allGoods.filter((g) => g.category_id === activeCatId) : allGoods;
    this.setData({ goods });
  },

  onCatTap(e) {
    const id = Number(e.currentTarget.dataset.id);
    if (id === this.data.activeCatId) return;
    this.setData({ activeCatId: id }, () => this.filterGoods());
  },

  async refreshCart() {
    try {
      const list = await api.get('/cart');
      const shopCart = (list.find((s) => s.shopId === Number(this.data.shopId)) || { goods: [] }).goods;
      const cartMap = {};
      let totalCount = 0;
      let totalPrice = 0;
      shopCart.forEach((g) => {
        cartMap[g.goodsId] = g.count;
        totalCount += g.count;
        totalPrice += g.price * g.count;
      });
      this.setData({
        cartList: shopCart,
        cartMap,
        totalCount,
        totalPrice: totalPrice.toFixed(2)
      });
    } catch (e) {
      // 已统一 toast
    }
  },

  async onAdd(e) {
    if (!isLogin()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    const { goods } = e.detail;
    try {
      await api.post('/cart', { shopId: this.data.shopId, goodsId: goods.id, count: 1 });
      await this.refreshCart();
    } catch (err) {
      // 已统一 toast
    }
  },

  async onMinus(e) {
    const { goods } = e.detail;
    const item = this.data.cartList.find((g) => g.goodsId === goods.id);
    if (!item) return;
    try {
      if (item.count <= 1) {
        await api.del('/cart/' + item.cartId);
      } else {
        await api.put('/cart/' + item.cartId, { count: item.count - 1 });
      }
      await this.refreshCart();
    } catch (err) {
      // 已统一 toast
    }
  },

  // 购物车弹层内步进器变化
  async onPanelChange(e) {
    const goods = e.currentTarget.dataset.goods;
    const newCount = e.detail.count;
    try {
      if (newCount <= 0) {
        await api.del('/cart/' + goods.cartId);
      } else {
        await api.put('/cart/' + goods.cartId, { count: newCount });
      }
      await this.refreshCart();
    } catch (err) {
      // 已统一 toast
    }
  },

  openPanel() {
    if (!this.data.totalCount) return;
    this.setData({ showCartPanel: true });
  },

  closePanel() {
    this.setData({ showCartPanel: false });
  },

  noop() {},

  onCheckout() {
    if (!this.data.totalCount) return;
    if (!isLogin()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({
      url: '/pages/confirm-order/confirm-order?shopId=' + this.data.shopId
    });
  }
});
