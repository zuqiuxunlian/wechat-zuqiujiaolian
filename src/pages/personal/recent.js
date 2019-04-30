const storage = require('../../lib/storage');
const apis = require('../../lib/apis');
const util = require('../../lib/util');

const app = getApp();

Page({
  data: {
    pageTitle: '',
    type: '',
    showList: [],
  },
  onShareAppMessage() {
    return {
      title: '足球教练社区',
      path: '/pages/index/index',
      imageUrl: 'https://static.zuqiuxunlian.com/2002_5_4.jpg'
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    storage.get(storage.keys.userInfo).then(user => {
      this.user = user;
      this.getUserData();
    })
    setTimeout(() => { wx.stopPullDownRefresh(); }, 2000);
  },
  onLoad(options) {
    const { type } = options;
    let pageTitle = '我的发布';
    if (type === 'recent_topics') {
      pageTitle = '我的发布';
    } else if (type === 'recent_replies') {
      pageTitle = '我的回复';
    }
    this.setData({
      pageTitle,
      type
    });

    storage.get(storage.keys.userInfo).then(user => {
      this.user = user;
      this.getUserData();
    })
  },
  // 获取用户信息
  getUserData() {
    if (!this.user) return;
    const url = `${apis.userDetail}/${this.user.loginname}`;
    wx.fetch({
      url,
      method: 'GET'
    }).then(res => {
      if (res && res.success) {
        console.log(res);
        const { recent_replies, recent_topics } = res.data;
        const showList = (this.data.type === 'recent_topics') ? recent_topics : recent_replies;
        this.setData({ showList });
      }
    })
  },
  // 详情
  toDetail(e) {
    const { item } = e.currentTarget.dataset;
    wx.redirectTo({
      url: `/pages/article/detail?from=recent&recenttype=${this.data.type}&id=${item.id}`
    })
  },
})
