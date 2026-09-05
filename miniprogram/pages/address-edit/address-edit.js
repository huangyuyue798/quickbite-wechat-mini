const api = require('../../utils/request');

const TAGS = ['家', '公司', '学校', '其他'];

Page({
  data: {
    id: null, // 编辑模式下的地址 id
    name: '',
    phone: '',
    region: ['广东省', '梅州市', '梅江区'],
    detail: '',
    tagIndex: 0,
    isDefault: false,
    tags: TAGS,
    saving: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: Number(options.id) });
      wx.setNavigationBarTitle({ title: '编辑地址' });
      this.loadAddress();
    }
  },

  async loadAddress() {
    try {
      const addresses = await api.get('/address');
      const addr = addresses.find((a) => a.id === this.data.id);
      if (addr) {
        this.setData({
          name: addr.name,
          phone: addr.phone,
          region: [addr.province, addr.city, addr.district],
          detail: addr.detail,
          tagIndex: Math.max(0, TAGS.indexOf(addr.tag)),
          isDefault: !!addr.is_default
        });
      }
    } catch (e) {
      // 已统一 toast
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onRegionChange(e) {
    this.setData({ region: e.detail.value });
  },

  onDetailInput(e) {
    this.setData({ detail: e.detail.value });
  },

  onTagTap(e) {
    this.setData({ tagIndex: Number(e.currentTarget.dataset.index) });
  },

  onDefaultChange(e) {
    this.setData({ isDefault: e.detail.value });
  },

  async onSave() {
    const { name, phone, region, detail, tagIndex, isDefault, id } = this.data;

    if (!name.trim()) return wx.showToast({ title: '请填写收货人姓名', icon: 'none' });
    if (!/^1\d{10}$/.test(phone)) return wx.showToast({ title: '请填写正确的手机号', icon: 'none' });
    if (!region || region.length !== 3) return wx.showToast({ title: '请选择所在地区', icon: 'none' });
    if (!detail.trim()) return wx.showToast({ title: '请填写详细地址', icon: 'none' });

    if (this.data.saving) return;
    this.setData({ saving: true });

    const payload = {
      name: name.trim(),
      phone,
      province: region[0],
      city: region[1],
      district: region[2],
      detail: detail.trim(),
      tag: TAGS[tagIndex],
      isDefault: isDefault ? 1 : 0
    };

    try {
      if (id) {
        await api.put('/address/' + id, payload);
      } else {
        await api.post('/address', payload);
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 600);
    } catch (e) {
      // 已统一 toast
    } finally {
      this.setData({ saving: false });
    }
  }
});
