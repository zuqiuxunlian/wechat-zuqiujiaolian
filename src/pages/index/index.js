const storage = require('../../lib/storage');
const util = require('../../lib/util');

const app = getApp();
const { contentHeight, barTitleHeight } = util.getNavigationData();

Page({
  data: {
    themeType: 'card', // 首页样式主题
    swiperMargin: '40rpx',
    contentHeight,
    barTitleHeight,

    pageCards: [{ // 卡片列表
      name: 'artical',
      text: '社区热帖',
      icon: 'cnode-tiezi',
      style: 'color: #026e00; font-size: 70rpx;',
      desc: '足球教练社区，聚集全国的基层教练员。'
    }, {
      name: 'news',
      text: '教练快讯',
      icon: 'cnode-xinwen',
      style: 'color: #3c82e2;',
      desc: '教练快讯, 实时更新国内青训动态。'
    }]
  },
  onShareAppMessage() {
    return {
      title: app.shareInfo.title,
      path: `/pages/index/index`
    }
  },
  onLoad() {},
  // 跳转
  gotoPage(e) {
    const { page } = e.currentTarget.dataset;
    let url = '/pages/index/index';
    if (page === 'news') {
      url = '/pages/artical/list?tab=news'; // 新闻列表
    } else if (page === 'artical') {
      url = '/pages/artical/list'
    }
    wx.navigateTo({ url });
  },
})