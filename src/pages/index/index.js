const storage = require('../../lib/storage');
const util = require('../../lib/util');
const apis = require('../../lib/apis');

const app = getApp();
const { contentHeight, barTitleHeight } = util.getNavigationData();

Page({
  data: {
    themeType: 'card', // 首页样式主题
    swiperMargin: '40rpx',
    contentHeight,
    barTitleHeight,

    // 卡片列表
    pageCards: [{
      name: 'article',
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
    }],
    showLayer: false,

    banners: [], // 首页banner模块列表
    bannerBoxHeight: '210rpx', // 轮播广告高度
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
  // 图片加载报错
  imageLoadError() {
    wx.showToast({
      title: 'image error',
      icon: 'none'
    })
  },
  // 点击广告弹窗
  handleAdTap(event) {
    const { item } = event.currentTarget.dataset;
    if (item.path) {
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
  // 图片载入后获取图片尺寸
  loadBannerImage(e) {
    const { index } = e.currentTarget.dataset;
    const { width, height } = e.detail;
    const ratio = width / height; // 原图宽高比
    // banner尺寸: 宽670, 高自适应
    const w = this.rpx2px(670);
    const h = w / ratio;
    this.setData({
      [`banners[${index}].height`]: `${h}px`,
      bannerBoxHeight: this.data.banners[0]['height'] || '210rpx'
    })
  },
  // 广告 banner change event
  bannerSwiperChange(event) {
    const { current } = event.detail;
    this.setData({
      bannerBoxHeight: this.data.banners[current]['height'] || '210rpx'
    })
  },
  // 单位转换: rpx to px
  rpx2px(rpx) {
    const { windowWidth } = wx.getSystemInfoSync();
    return (windowWidth / 750) * rpx;
  }
})
