Component({
  properties: {
    // 购物车商品总数
    totalCount: {
      type: Number,
      value: 0
    },
    // 总价
    totalPrice: {
      type: Number,
      value: 0
    },
    // 按钮文案
    actionText: {
      type: String,
      value: '去结算'
    },
    // 是否可点击
    disabled: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onAction() {
      if (this.data.disabled) return;
      this.triggerEvent('action');
    }
  }
});
