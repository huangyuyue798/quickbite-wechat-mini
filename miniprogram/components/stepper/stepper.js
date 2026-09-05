Component({
  properties: {
    // 当前数量
    count: {
      type: Number,
      value: 0
    },
    // 最小数量（通常为 0 或 1）
    min: {
      type: Number,
      value: 0
    },
    // 最大数量
    max: {
      type: Number,
      value: 999
    }
  },

  methods: {
    onMinus() {
      if (this.data.count <= this.data.min) return;
      this.triggerEvent('change', { count: this.data.count - 1 });
    },
    onPlus() {
      if (this.data.count >= this.data.max) {
        wx.showToast({ title: '已达库存上限', icon: 'none' });
        return;
      }
      this.triggerEvent('change', { count: this.data.count + 1 });
    }
  }
});
