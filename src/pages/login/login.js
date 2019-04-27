const storage = require('../../lib/storage');
const apis = require('../../lib/apis');
const util = require('../../lib/util');

const app = getApp();

Page({
  data: {
    userInfo: null, // 用户信息
    hasAuthorization: false, // 用户是否授权
    authDeny: null
  },
  onShareAppMessage() {
    return {
      title: '足球教练社区',
      path: '/pages/index/index',
      imageUrl: 'https://static.zuqiuxunlian.com/2002_5_4.jpg'
    }
  },
  onLoad(options) {
    const { callbackUrl } = options;
    if (callbackUrl) {
      this.callbackUrl = decodeURIComponent(callbackUrl);
    }
  },
  onShow() {
    this.initUserAuthStatus();
  },
  // 用户登录, 获取并存储token; 根据token获取用户信息
  login(data) {
    return wx.fetch({
      url: apis.login,
      method: 'POST',
      data
    }).then(res => {
      if (res && res.success) {
        storage.set(storage.keys.authToken, res.data);
        this.getUserInfoByAuth(res.data);
      }
    })
  },
  // 根据 token 或 accesstoken 获取用户信息;
  // type取值: 'token'或'accesstoken'
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
        this.setData({
          userInfo: res.data
        });
        app.event.emit('triggerAfterLogin');
        wx.hideLoading();

        // 登录后跳转,默认跳转到个人中心
        if (this.callbackUrl) {
          wx.redirectTo({
            url: this.callbackUrl
          });
        } else {
          wx.switchTab({
            url: '/pages/personal/personal'
          })
        }
      }
    })
  },
  // 用户授权登录
  handleUserInfoBtn(e) {
    // 用户拒绝授权
    if (!e.detail || !e.detail.userInfo) {
      this.setData({ authDeny: true })
      return;
    }
    wx.showLoading({
      title: '登录中',
      mask: false
    });
    setTimeout(() => {
      wx.hideLoading();
    }, 8000);

    // 获取登录code
    wx.login({
      success: (data) => {
        if (data.code) {
          setTimeout(() => {
            this.login({
              code: data.code,
              authInfo: e.detail
            });
          }, 1200);
        } else {
          console.log('login fail')
        }
      }
    })
  },
  // 获取用户授权状态
  initUserAuthStatus() {
    wx.getSetting({
      success: (res) => {
        this.setData({
          hasAuthorization: !!res.authSetting['scope.userInfo']
        })
      }
    })
  }
})
