const api = require('../../utils/request');
const { formatSales } = require('../../utils/util');

Page({
  data: {
    keyword: '',
    categories: ['全部'],
    activeCategory: '全部',
    shops: [],
    loading: false,
    formatSales
  },

  onLoad() {
    this.loadCategories();
    this.loadShops();
  },

  onShow() {
    // 从店铺页返回时刷新，保持数据新鲜
    if (this.data.shops.length) {
      this.loadShops(true);
    }
  },

  onPullDownRefresh() {
    Promise.all([this.loadCategories(true), this.loadShops(true)]).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadCategories(silent) {
    try {
      const categories = await api.get('/shops/categories');
      this.setData({ categories: ['全部', ...categories] });
    } catch (e) {
      // 已统一 toast
    }
  },

  async loadShops(silent) {
    if (!silent) this.setData({ loading: true });
    try {
      const { list } = await api.get('/shops', {
        keyword: this.data.keyword,
        category: this.data.activeCategory === '全部' ? '' : this.data.activeCategory
      });
      this.setData({ shops: list });
    } catch (e) {
      // 已统一 toast
    } finally {
      this.setData({ loading: false });
    }
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadShops();
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    if (category === this.data.activeCategory) return;
    this.setData({ activeCategory: category }, () => this.loadShops());
  },

  onTapShop(e) {
    wx.navigateTo({ url: '/pages/shop/shop?id=' + e.detail.id });
  }
});
