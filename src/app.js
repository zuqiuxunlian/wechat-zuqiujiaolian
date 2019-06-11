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

    this.slienceLogin();
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
  version: 'v1.2.0', // 版本号
  shareInfo: {
    title: `足球教练社区`
  },
  // 获取配置
  getWeappConfig() {
    wx.fetch({
      header: {
        version: '1.1.0'
      },
      url: apis.appConfig
    }).then(res => {
      if (res.success) {
        if (res.data.has_post) this.globalData.hasPost = res.data.has_post;
        // if (res.data.card_ads) this.globalData.cardAds = res.data.card_ads;
      }
    })
  },
  // auto login
  slienceLogin() {
    wx.getSetting({
      success: (res) => {
        if (!!res.authSetting['scope.userInfo']) {
          wx.login({
            success: (data) => {
              if (data.code) {
                setTimeout(() => {
                  wx.getUserInfo({
                    success: (authInfo) => {
                      const loginParams = { code: data.code, authInfo };
                      wx.fetch({
                        url: apis.login,
                        method: 'POST',
                        data: loginParams
                      }).then(res => {
                        if (res && res.success) {
                          storage.set(storage.keys.authToken, res.data);
                          this.getUserInfoByAuth(res.data);
                        }
                      })
                    }
                  })
                }, 1600);
              }
            }
          })
        }
      }
    })
  },
  // 根据 token 或 accesstoken 获取用户信息; type取值: 'token'或'accesstoken'
  getUserInfoByAuth(code, type = 'token') {
    const url = `${apis.userinfo}?${type}=${code}`;
    wx.fetch({
      url,
      method: 'GET',
      data: {}
    }).then(res => {
      if (res && res.success) {
        storage.set(storage.keys.userInfo, res.data);
        storage.set(storage.keys.accessToken, res.data.accessToken);
      }
    })
  },
})