const apis = require('../../lib/apis');
const util = require('../../lib/util');

Page({
  data: {
    detail: null,
  },
  onShareAppMessage() {
    return {
      title: 'Node随心阅',
      path: '/pages/artical/list'
    }
  },
  onLoad(option) {
    const {
      id
    } = option;
    if (id) {
      this.getDetail(id);
    } else {
      wx.reLaunch({
        url: '/pages/artical/list'
      })
    }
  },
  // 获取帖子详情
  getDetail(id = '5c74a05fab86b86ddf6b2ceb') {
    wx.fetch({
      url: `${apis.topicDetail}/${id}`,
      data: {
        mdrender: false
      }
    }).then(res => {
      const detail = res.data;
      detail.replies.forEach(reply => {
        reply.createTime = util.transformDateTime(new Date(reply.create_at));
      })
      this.updateShareMessage({
        title: `NodeJS前端速报-${detail.title}`,
        path: `/pages/artical/list?tab=${detail.tab || 'all'}&homeToPage=${encodeURIComponent(`/pages/artical/detail?id=${id}`)}`
      });
      // wx.setNavigationBarTitle({ title: detail.title }); // 设置页面标题
      this.setData({
        detail
      });
    })
  },

  // 图片预览
  previewImage(event) {
    const {
      url
    } = event.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },
  // 更新页面分享参数
  updateShareMessage(shareInfo) {
    this.onShareAppMessage = () => shareInfo;
  },
})
