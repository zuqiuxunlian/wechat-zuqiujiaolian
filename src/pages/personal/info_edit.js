const storage = require('../../lib/storage');
const apis = require('../../lib/apis');
const app = getApp();

Page({
  data: {
    pageTitle: '用户信息修改',
    showData: null,
    pwd: '',
    rePwd: ''
  },
  onLoad(options) {
    const { type } = options;
    this.type = type;
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
        } else if (type === 'password') {
          pageTitle = '密码修改';
          showData = {
            title: '密码',
            feild: type,
            value: ''
          }
        }
        this.setData({
          pageTitle,
          showData
        })
      }
    });

  },
  // 密码/确认密码输入
  inputPwd(event) {
    const { value } = event.detail;
    const { type } = event.currentTarget.dataset;
    this.setData({
      [type]: value
    })
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
    let postData = {};
    let url = apis.userinfo;
    if (this.type === 'password') {
      url = apis.changePassword;
      if (!this.data.pwd || !this.data.rePwd) {
        wx.showToast({
          title: '新密码不能为空',
          icon: 'none'
        })
        return;
      } else if (this.data.pwd !== this.data.rePwd) {
        wx.showToast({
          title: '两次密码不一致, 请重新输入',
          icon: 'none'
        })
        return;
      }
      postData = {
        newPass: this.data.pwd,
	      rePass: this.data.rePwd
      }
    } else {
      if (!this.data.showData.value) {
        wx.showToast({
          title: `${this.data.showData.title}不能为空`,
          icon: 'none'
        })
        return;
      }
      postData[this.data.showData.feild] = this.data.showData.value;
    }

    wx.showLoading({
      title: '正在提交...'
    });
    wx.fetch({
      url: `${url}?accesstoken=${this.accessToken}`,
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