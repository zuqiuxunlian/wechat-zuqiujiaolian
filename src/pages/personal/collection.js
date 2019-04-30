const storage = require('../../lib/storage');
const util = require('../../lib/util');
const apis = require('../../lib/apis');
const { barTopHeight } = util.getNavigationData();

const app = getApp();

Page({
  data: {
    barTopHeight,
    status: false,
    list: [], // 收藏列表
  },
  onLoad() {
    storage.get(storage.keys.userInfo).then(user => {
      this.getCollections(user);
    })
  },
  onShow() {},
  // 获取收藏列表
  getCollections(userInfo) {
    this.setData({ list: [] });
    if (userInfo && userInfo.loginname) {
      wx.fetch({
        url: `${apis.topicCollect}/${userInfo.loginname}`
      }).then(res => {
        if (res.success) {
          const resObj = {};
          const data = res.data;
          const length = this.data.list.length;
          data.forEach((item, i) => {
            item.tabName = util.tabToWord(item.tab);
            item.date = util.transformDateTime(new Date(item.create_at));
            item.tabText = util.tabToWord(item.tab) || null;
            item.summary = `摘要: ${item.content.split('\r')[0]}...`;
            resObj[`list[${length + i}]`] = item;
          });
          this.setData(resObj);
        }
      })
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    storage.get(storage.keys.userInfo).then(user => {
      this.getCollections(user);
    })
    setTimeout(() => { wx.stopPullDownRefresh(); }, 2000);
  },
  // 跳转详情
  toDetail(event) {
    const {
      item
    } = event.currentTarget.dataset;
    wx.redirectTo({
      url: `/pages/article/detail?from=collect&id=${item.id}`
    })
  }
})
