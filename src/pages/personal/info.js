const storage = require('../../lib/storage');
const apis = require('../../lib/apis');
const app = getApp();

Page({
  data: {
    user: null,
    region: null,
    hasUpdated: false
  },
  onLoad() {
    storage.get(storage.keys.userInfo).then(user => {
      if (user) {
        const {
          loginname = '',
          name = '',
          email = '',
          url = '',
          location = '',
          weibo = '',
          signature = '',
          accessToken
        } = user;

        // 邮箱已存在则已经修改过了
        // this.setData({ hasUpdated: !!email });

        // 地区
        let region = null;
        if (location.split(',').length === 3) {
          region = location.split(',');
        } else {
          region = ['上海市', '上海市', '闵行区'];
        }
        this.setData({
          user: {
            loginname,
            name,
            email,
            url,
            location,
            weibo,
            signature,
            accessToken
          },
          region
        })
      }

    });
  },
  // 用户输入
  updateInput(event) {
    const { value } = event.detail;
    const { feild } = event.currentTarget.dataset;
    if (value) {
      this.setData({
        [`user.${feild}`]: value
      })
    }
  },
  // 省市区选择
  bindRegionChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    const selData = e.detail.value;
    this.setData({
      region: selData
    })
  },
  // 确认修改
  comfirmEdit() {
    this.data.user.location = this.data.region.join(',');
    console.log(this.data.user);

    // wx.hideLoading()
    wx.showLoading({
      title: '正在提交...'
    });
    wx.fetch({
      url: `${apis.userinfo}?accesstoken=${this.data.user.accessToken}`,
      method: 'POST',
      data: this.data.user
    }).then(res => {
      wx.hideLoading();
      if (res && res.success) {
        this.updateUserInfoByAuth();
        wx.showToast({
          title: `修改成功`,
          icon: 'success'
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
      url: `${apis.userinfo}?accesstoken=${this.data.user.accessToken}`,
      method: 'GET',
      data: {}
    }).then(res => {
      if (res && res.success) {
        storage.set(storage.keys.userInfo, res.data);
        storage.set(storage.keys.accessToken, res.data.accessToken);
        this.setData({
          userInfo: res.data
        });
        wx.safeNavigateTo({
          url: '/pages/personal/personal'
        })
      }
    })
  },
})