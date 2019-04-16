const storage = require('../../lib/storage');
const apis = require('../../lib/apis');
const app = getApp();

Page({
  data: {
    pageTitle: '用户信息修改',
    showData: null
  },
  onLoad(options) {
    const { type } = options;
    storage.get(storage.keys.userInfo).then(user => {
      if (user) {
        const {
          loginname = '',
          email = '',
          name = '',
          url = '',
          location = '',
          weibo = '',
          signature = '',
          accessToken
        } = user;
        this.accessToken = accessToken;
        let showData = {};
        let pageTitle = '用户信息修改';
        if (type === 'loginname') {
          pageTitle = 'ID修改';
          showData = {
            title: 'ID',
            feild: type,
            value: loginname || ''
          }
        } else if (type === 'email') {
          pageTitle = '邮箱修改';
          showData = {
            title: '邮箱',
            feild: type,
            value: email || ''
          }
        }
        this.setData({
          pageTitle,
          showData
        })
      }
    });

  },
  // 用户输入
  updateInput(event) {
    const { value } = event.detail;
    if (value) {
      this.setData({
        [`showData.value`]: value
      })
    }
  },
  // 确认修改
  comfirmEdit() {
    const postData = {};
    postData[this.data.showData.feild] = this.data.showData.value;
    wx.showLoading({
      title: '正在提交...'
    });
    wx.fetch({
      url: `${apis.userinfo}?accesstoken=${this.accessToken}`,
      method: 'POST',
      data: postData
    }).then(res => {
      wx.hideLoading();
      if (res && res.success) {
        this.updateUserInfoByAuth();
        wx.showToast({
          title: `修改成功`,
          icon: 'success',
          mask: true
        })
      } else {
        wx.showToast({
          title: `修改失败, ${res.error_msg}`,
          icon: 'none'
        })
      }
    })
  },
  // 更新用户信息
  updateUserInfoByAuth() {
    wx.fetch({
      url: `${apis.userinfo}?accesstoken=${this.accessToken}`,
      method: 'GET',
      data: {}
    }).then(res => {
      if (res && res.success) {
        storage.set(storage.keys.userInfo, res.data);
        storage.set(storage.keys.accessToken, res.data.accessToken);
        setTimeout(() => {
          wx.navigateBack();
        }, 1600);
      }
    })
  },
})