const fetch = require('./lib/fetch');
wx.fetch = fetch;

App({
  onLaunch () {

  },
  globalData: {},
  appConfig: {
    listRotateAnimation: false, // 列表页面卡片动画
    appHomePath: '/pages/artical/list', // 自定义导航首页路径
  }
})
