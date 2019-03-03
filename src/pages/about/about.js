const storage = require('../../lib/storage');
const app = getApp();

Page({
  data: {
    status: false
  },
  onLoad() {
    this.setData({ status: app.appConfig.listRotateAnimation });
  },
  // 首页列表动画是否开启
  switchChange(e) {
    app.appConfig.listRotateAnimation = e.detail.value;
    storage.set(storage.keys.listRotateAnimation, e.detail.value);
  },
  // open webview
  openWebview() {
    wx.navigateTo({
      url: '/pages/webview/webview'
    })
  }
})
