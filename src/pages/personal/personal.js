const storage = require('../../lib/storage');
const apis = require('../../lib/apis');
const util = require('../../lib/util');

const app = getApp();

Page({
  data: {
    version: app.version,
    userInfo: null, // 用户信息
    hasAuthorization: false, // 用户是否授权
    authDeny: null
  },
  onLoad() {},
  onShow() {
    this.initUserAuthStatus();
    storage.get(storage.keys.userInfo).then(user => {
      if (!user) {
        // 用户未登录提前调用 wx.login
        // wx.login({
        //   success: (res) => {
        //     if (res.code) {
        //       this.loginCode = res.code;
        //     } else {
        //       console.log('login fail')
        //     }
        //   }
        // })
      } else {
        this.setData({
          userInfo: user ? user : null
        })
      }
    })
  },
  // 退出登录
  logout() {
    wx.showModal({
      title: '温馨提示',
      content: '您确定要退出登录?',
      cancelText: '暂不退出',
      confirmText: '狠心离开',
      success: (res) => {
        if (res.confirm) {
          storage.clear();
          this.setData({ userInfo: null });

          // 退出登录刷新loginCode
          // wx.login({
          //   success: (data) => {
          //     if (data.code) {
          //       this.loginCode = data.code;
          //     } else {
          //       console.log('login fail')
          //     }
          //   }
          // })
        } else if (res.cancel) {
          console.log('cancel logout')
        }
      }
    })
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
        wx.hideLoading();
      }
    })
  },
  // 用户授权登录
  handleUserInfoBtn(e) {
    // 用户拒绝授权
    if (!e.detail || !e.detail.userInfo) {
      // wx.showToast({
      //   title: '登录失败',
      //   icon: 'none'
      // })
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
          }, 500);
        } else {
          console.log('login fail')
        }
      }
    })

    // 用户允许授权
    // wx.showLoading({
    //   title: '登录中',
    //   mask: false
    // });
    // setTimeout(() => {
    //   wx.hideLoading();
    // }, 8000);
    // if (this.loginCode) {
    //   wx.checkSession({
    //     success: () => { // session_key 未过期，并且在本生命周期一直有效
    //       this.login({
    //         code: this.loginCode,
    //         authInfo: e.detail
    //       });
    //     },
    //     fail: () => { // session_key 已经失效，需要重新执行登录流程; 重新登录
    //       wx.login({
    //         success: (res) => {
    //           if (res.code) {
    //             this.login({
    //               code: res.code,
    //               authInfo: e.detail
    //             });
    //           } else {
    //             console.log('login fail');
    //           }
    //         }
    //       })
    //     }
    //   })
    // }
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
  },
  // 跳转个人中心
  toUserInfo() {
    wx.safeNavigateTo({
      url: '/pages/personal/info'
    })
  },
  // 发布话题
  toPost() {
    wx.safeNavigateTo({
      url: '/pages/article/post'
    })
  },
  // 验证用户Accesstoken
  // checkAccesstoken(accesstoken) {
  //   if (!accesstoken) {
  //     accesstoken = storage.get(storage.keys.accessToken, true)
  //   }
  //   return wx.fetch({
  //     url: apis.accesstoken,
  //     method: 'POST',
  //     data: {
  //       accesstoken
  //     }
  //   }).then(res => {
  //     const {
  //       success,
  //       loginname,
  //       id,
  //       avatar_url
  //     } = res;
  //     let user = null;
  //     if (success) {
  //       user = {
  //         id,
  //         name: loginname,
  //         avatarUrl: avatar_url
  //       }
  //       storage.set(storage.keys.userInfo, user);
  //       storage.set(storage.keys.accessToken, accesstoken);
  //     }
  //     return user;
  //   })
  // }
})
