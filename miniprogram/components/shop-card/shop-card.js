Component({
  properties: {
    shop: {
      type: Object,
      value: {}
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tapshop', { id: this.data.shop.id });
    }
  }
});
