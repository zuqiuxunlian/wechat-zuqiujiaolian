const storage = require('../../lib/storage');
const util = require('../../lib/util');
const apis = require('../../lib/apis');

const app = getApp();
const { contentHeight, barTitleHeight } = util.getNavigationData();

Page({
  data: {
    themeType: 'card', // 首页样式主题
    swiperMargin: '40rpx',
    contentHeight: contentHeight + barTitleHeight,
    barTitleHeight,

    // 卡片列表
    pageCards: [{
      name: 'article',
      text: '社区热帖',
      icon: 'cnode-tiezi',
      style: 'color: #026e00; font-size: 70rpx;',
      desc: '莫愁前路无知己，看看他们都是怎么训练的。'
    }, {
      name: 'news',
      text: '教练快讯',
      icon: 'cnode-xinwen',
      style: 'color: #3c82e2;',
      desc: '开阔视野，看全球媒体如何报道足球培训。'
    }],
    showLayer: false,

    banners: [], // 首页banner模块列表
  },
  onShareAppMessage() {
    return {
      title: app.shareInfo.title,
      path: `/pages/index/index`
    }
  },
  onLoad() {
    this.getAdsConfig();
  },
  // 跳转
  gotoPage(e) {
    const { page } = e.currentTarget.dataset;
    let url = '/pages/index/index';
    if (page === 'news') {
      url = '/pages/article/list?tab=news'; // 新闻列表
    } else if (page === 'article') {
      url = '/pages/article/list'
    }
    wx.navigateTo({ url });
  },
  // 点击广告弹窗
  handleAdTap(event) {
    const { item } = event.currentTarget.dataset;
    if (item.appid) {
      wx.navigateToMiniProgram({
        appId: item.appid,
        path: item.path,
        success(res) {}
      })
    } else {
      wx.safeNavigateTo({
        url: item.path
      })
    }
  },
  // 浮标点击处理
  switchLayerStatus(e) {
    // this.setData({
    //   showLayer: !this.data.showLayer
    // })
    wx.safeNavigateTo({
      url: '/pages/poster/poster'
    })
  },

  // 获取广告配置
  getAdsConfig() {
    wx.fetch({
      url: apis.ads
    }).then(res => {
      if (res.success && res.data.card_ads) {
        this.setData({
          banners: res.data.card_ads
        })
      }
    })
  },
})
