const api = require('../../utils/request');

Page({
  data: {
    addresses: [],
    // 选择模式（从确认订单页进入时传 select=1）
    selectMode: false,
    loading: true
  },

  onLoad(options) {
    this.setData({ selectMode: options.select === '1' });
  },

  onShow() {
    this.loadAddresses();
  },

  async loadAddresses() {
    this.setData({ loading: true });
    try {
      const addresses = await api.get('/address');
      this.setData({ addresses });
    } catch (e) {
      // 已统一 toast
    } finally {
      this.setData({ loading: false });
    }
  },

  onSelect(e) {
    if (!this.data.selectMode) return;
    const id = e.currentTarget.dataset.id;
    const address = this.data.addresses.find((a) => a.id === id);
    if (!address) return;
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel && eventChannel.emit) {
      eventChannel.emit('selectAddress', { address });
    }
    wx.navigateBack();
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/address-edit/address-edit?id=' + id });
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' });
  },

  onSetDefault(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '设为默认收货地址？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.put('/address/' + id + '/default');
          wx.showToast({ title: '已设为默认', icon: 'success' });
          this.loadAddresses();
        } catch (err) {
          // 已统一 toast
        }
      }
    });
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除地址',
      content: '确定删除该地址吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.del('/address/' + id);
          wx.showToast({ title: '已删除', icon: 'success' });
          this.loadAddresses();
        } catch (err) {
          // 已统一 toast
        }
      }
    });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  noop() {}
});
