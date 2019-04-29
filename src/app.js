const fetch = require('./lib/fetch');
const storage = require('./lib/storage');
const event = require('./lib/event')
const apis = require('./lib/apis');

const emitter = new event.EventEmitter();

wx.fetch = fetch;

/** 安全跳转 */
wx.safeNavigateTo = (obj) => {
  wx.navigateTo({
    url: obj.url,
    fail() {
      wx.redirectTo({
        url: obj.url,
        fail() {
          wx.switchTab({
            url: obj.url
          });
        }
      });
    }
  });
};

App({
  onLaunch() {
    emitter.setMaxListeners(0);
    this.getWeappConfig(); // APP启动时获取配置
  },
  onShow() {},
  event: emitter,
  globalData: {
    // hasPost: true
  },
  appConfig: {
    listRotateAnimation: storage.get(storage.keys.listRotateAnimation, true) || false, // 列表页面卡片动画
    appHomePath: '/pages/index/index', // 自定义导航首页路径
  },
  version: 'v1.0.1', // 版本号
  shareInfo: {
    title: `足球教练社区`
  },
  // 获取配置
  getWeappConfig() {
    wx.fetch({
      header: {
        version: '1.0.1'
      },
      url: apis.appConfig
    }).then(res => {
      if (res.success) {
        // if (res.data.has_post) this.globalData.hasPost = res.data.has_post;
        if (res.data.card_ads) this.globalData.cardAds = res.data.card_ads;
      }
    })
  }
})