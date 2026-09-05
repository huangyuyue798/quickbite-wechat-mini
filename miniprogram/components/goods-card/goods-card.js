Component({
  properties: {
    goods: {
      type: Object,
      value: {}
    },
    // 当前数量（父组件传入，用于显示加减按钮状态）
    count: {
      type: Number,
      value: 0
    }
  },

  methods: {
    onAdd() {
      this.triggerEvent('add', { goods: this.data.goods });
    },
    onMinus() {
      this.triggerEvent('minus', { goods: this.data.goods });
    }
  }
});
