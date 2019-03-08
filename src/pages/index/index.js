const storage = require('../../lib/storage');
const util = require('../../lib/util');
const CLunar = require('../../npm/chinese-lunar');

const app = getApp();
const { contentHeight, barTitleHeight } = util.getNavigationData();

const dayText = ['日', '一', '二', '三', '四', '五', '六'];

Page({
  data: {
    swiperMargin: '40rpx',
    contentHeight,
    barTitleHeight,

    dateInfo: null, // 日期
    pageCards: [{ // 卡片列表
      name: 'artical',
      text: '帖子列表',
      url: '../../image/poster2.jpg',
    }, {
      name: 'square',
      text: '趣图广场',
      url: '../../image/poster1.jpg',
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