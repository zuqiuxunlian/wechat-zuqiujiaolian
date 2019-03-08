const fetch = require('./lib/fetch');
const storage = require('./lib/storage');

wx.fetch = fetch;

App({
  onLaunch () {

  },
  globalData: {},
  appConfig: {
    listRotateAnimation: storage.get(storage.keys.listRotateAnimation, true) || false, // 列表页面卡片动画
    appHomePath: '/pages/index/index', // 自定义导航首页路径
  }
})
