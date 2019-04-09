const storage = require('../../lib/storage');
const apis = require('../../lib/apis');
const util = require('../../lib/util');

const app = getApp();

Page({
  data: {
    version: app.version,
    userInfo: null, // 用户信息
    collections: [], // 收藏列表
  },
  onLoad() {},
  onShow() {
    storage.get(storage.keys.userInfo).then(user => {
      this.setData({
        userInfo: user ? user : null
      })
      this.getCollections();
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
          // storage.remove(storage.keys.userInfo, true);
          // storage.remove(storage.keys.accessToken, true);
          // storage.remove(storage.keys.collections, true);
          storage.clear();
          this.setData({
            userInfo: null,
            collections: []
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  // 登录(扫码获取accessToken，并保存)
  login() {
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
        const {
          result,
          scanType,
          charSet,
          path,
          rawData
        } = res;
        console.log(result);
        this.checkAccesstoken(result).then(user => {
          this.setData({
            userInfo: user
          })
          this.getCollections();
        });
      },
      fail: (err) => {
        console.log('扫码登录失败!');
      }
    })
  },
  // 验证用户Accesstoken
  checkAccesstoken(accesstoken) {
    if (!accesstoken) {
      accesstoken = storage.get(storage.keys.accessToken, true)
    }
    return wx.fetch({
      url: apis.accesstoken,
      method: 'POST',
      data: {
        accesstoken
      }
    }).then(res => {
      const {
        success,
        loginname,
        id,
        avatar_url
      } = res;
      let user = null;
      if (success) {
        user = {
          id,
          name: loginname,
          avatarUrl: avatar_url
        }
        storage.set(storage.keys.userInfo, user);
        storage.set(storage.keys.accessToken, accesstoken);
      }
      return user;
    })
  },
  // 获取收藏列表
  getCollections() {
    if (this.data.userInfo && this.data.userInfo.name) {
      wx.fetch({
        url: `${apis.topicCollect}/${this.data.userInfo.name}`
      }).then(res => {
        if (res.success) {
          this.setData({
            collections: res.data
          })
          storage.set(storage.keys.collections, res.data); // 存储用户收藏
        }
      })
    }
  },
  // 获取用户详情
  getUserInfo() {
    //
  },
  // open webview
  openWebview() {
    wx.navigateTo({
      url: '/pages/webview/webview'
    })
  },
  // 实验功能
  toLib() {
    wx.navigateTo({
      url: '/pages/lib/lib'
    })
  },
  // 我的收藏
  toCollection() {
    wx.navigateTo({
      url: '/pages/personal/collection'
    })
  },
  // 登录说明
  loginTip() {
    wx.showModal({
      title: '登录说明',
      content: '本小程序数据来自 https://cnodejs.org 站点，目前仅支持扫码登录。用户需先登录cnodejs.org站点PC端后，在设置页面可以看到自己的 accessToken。再点击小程序中个人中心登录按钮，以扫码的形式登录即可登录成功。',
      showCancel: false,
      success(res) {
        if (res.confirm) {
          // console.log('用户点击确定')
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })

  }
})
