Page({
  data: {
    jumpUrl: ''
  },
  onLoad(option) {
    let { jumpUrl } = option;
    if (!jumpUrl) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
    }

    jumpUrl = decodeURIComponent(jumpUrl);
    this.setData({ jumpUrl })
  }
})
