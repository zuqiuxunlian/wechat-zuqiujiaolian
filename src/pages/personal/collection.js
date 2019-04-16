const storage = require('../../lib/storage');
const util = require('../../lib/util');
const { barTopHeight } = util.getNavigationData();

const app = getApp();

Page({
  data: {
    barTopHeight,
    status: false,
    list: [], // 收藏列表
  },
  onLoad() {
    storage.get(storage.keys.collections).then(data => {
      if (!data || data.length === 0) return;
      // console.log(data);
      const resObj = {};
      const length = this.data.list.length;
      data.forEach((item, i) => {
        item.tabName = util.tabToWord(item.tab);
        item.date = util.transformDateTime(new Date(item.create_at));
        item.tabText = util.tabToWord(item.tab) || null;
        item.summary = `摘要: ${item.content.split('\r')[0]}...`;
        resObj[`list[${length + i}]`] = item;
      });
      // console.log(resObj);
      this.setData(resObj);
    })
  },
  // 跳转详情
  toDetail(event) {
    const {
      item
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/article/detail?id=${item.id}`
    })
  },
  // 帖子列表
  toTopics() {
    wx.safeNavigateTo({
      url: `/pages/article/list?tab=all`
    })
  }
})
