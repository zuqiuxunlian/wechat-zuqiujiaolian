Page({
  data: {
    openPath: '',
  },
  onLoad(options) {
    const {
      url = 'https://aoxiaoqiang.com', // 默认地址
    } = options;
    if (url && /^https?/gi.test(url)) {
      this.setData({
        openPath: url
      })
    } else {
      wx.showToast({
        title: 'URL错误',
        icon: 'none'
      })
    }
  }
})
