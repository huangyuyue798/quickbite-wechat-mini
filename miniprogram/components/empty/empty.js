Component({
  properties: {
    // 空状态提示文案
    text: {
      type: String,
      value: '暂无数据'
    },
    // 按钮文案，为空则不显示按钮
    btnText: {
      type: String,
      value: ''
    }
  },

  methods: {
    onBtn() {
      this.triggerEvent('action');
    }
  }
});
