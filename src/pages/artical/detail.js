const apis = require('../../lib/apis');
const util = require('../../lib/util');
const storage = require('../../lib/storage');

Page({
  data: {
    navTitle: '话题详情',
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
      this.detailId = id; // 文章id
      this.getDetail(id).then(res => {
        const detail = res.data;
        detail.replies.forEach(reply => {
          reply.createTime = util.transformDateTime(new Date(reply.create_at));
        })
        this.setData({ detail });

        // 读取缓存文章位置，并自动滚动到目标位置
        storage.get(storage.keys.readLoc).then(storeRead => {
          if (storeRead && storeRead.id === this.detailId) {
            wx.pageScrollTo({
              scrollTop: storeRead.top || 0,
              duration: 300
            });
          }
        })

        // 设置分享参数
        this.updateShareMessage({
          title: `NodeJS前端速报-${detail.title}`,
          path: `/pages/artical/list?tab=${detail.tab || 'all'}&homeToPage=${encodeURIComponent(`/pages/artical/detail?id=${id}`)}`
        });
        // this.setData({ navTitle: detail.title }); // 设置页面标题
      });
    } else {
      wx.reLaunch({
        url: '/pages/artical/list'
      })
    }
  },
  // 页面滚动记录滚动位置
  onPageScroll(obj) {
    if (this.isScrolling) {
      clearTimeout(this.scrollTimer);
      return this.setScrollTimer();
    }
    this.isScrolling = true;
    this.setScrollTimer();
    if (this.detailId) {
      console.log(obj.scrollTop);
      storage.set(storage.keys.readLoc, {
        id: this.detailId,
        top: obj.scrollTop
      })
    }
  },
  setScrollTimer() {
    this.scrollTimer = setTimeout(() => {
      this.isScrolling = false;
    }, 50);
  },
  // 获取帖子详情
  getDetail(id = '5c74a05fab86b86ddf6b2ceb') {
    return wx.fetch({
      url: `${apis.topicDetail}/${id}`,
      data: {
        mdrender: false
      }
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
