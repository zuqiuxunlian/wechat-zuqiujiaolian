const app = getApp();

Page({
  data: {
    status: false
  },
  onLoad() {
    this.setData({ status: app.appConfig.listRotateAnimation });
  },
  switchChange(e) {
    app.appConfig.listRotateAnimation = e.detail.value;
  },
})
