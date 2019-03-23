const storage = require('../../lib/storage');
const util = require('../../lib/util');
const CLunar = require('../../npm/chinese-lunar');

const app = getApp();
const { contentHeight, barTitleHeight } = util.getNavigationData();

const dayText = ['日', '一', '二', '三', '四', '五', '六'];

Page({
  data: {
    themeType: 'card', // 首页样式主题
    swiperMargin: '40rpx',
    contentHeight,
    barTitleHeight,

    dateInfo: null, // 日期
    pageCards: [{ // 卡片列表
      name: 'artical',
      text: '帖子列表',
      icon: 'cnode-logo',
      style: 'font-size: 36rpx; color: #026e00;',
      desc: 'Node知识分享、行业招聘、精选热帖等，技术路上我们同在。'
    }, {
      name: 'square',
      text: '趣图广场',
      icon: 'cnode-mbri-image-gallery',
      style: 'color: #3c82e2;',
      desc: '搞笑、减压沙雕图，总有一张能表达你此刻的心情。哈哈哈...'
    }]
  },
  onShareAppMessage() {
    return {
      title: '随心阅',
      path: `/pages/index/index`
    }
  },
  onLoad() {
    const current = new Date();
    this.setData({
      dateInfo: {
        chineseDate: CLunar.solarToLunar(current, 'YMD'),
        weekDay: `周${dayText[current.getDay()]}`,
        date: util.fillZero(current.getDate())
      }
    })
  },
  // 跳转
  gotoPage(e) {
    const { page } = e.currentTarget.dataset;
    let url = '/pages/index/index';
    if (page === 'square') {
      url = '/pages/square/square'
    } else if (page === 'artical') {
      url = '/pages/artical/list'
    }
    wx.navigateTo({ url });
  },
})