const apis = require('../../lib/apis');
const util = require('../../lib/util');
const storage = require('../../lib/storage');

const app = getApp();

Page({
  data: {
    navTitle: '话题详情',
    detail: null
  },
  onShareAppMessage() {
    return {
      title: app.shareInfo.title,
      path: '/pages/article/list'
    }
  },
  onLoad(option) {
    app.event.on('triggerAfterReply', this.getDetail.bind(this));
    const {
      id
    } = option;
    if (id) {
      this.detailId = id; // 文章id
      this.getDetail(id);
    } else {
      wx.reLaunch({
        url: '/pages/article/list'
      })
    }
  },
  // 获取帖子详情
  getDetail(id) {
    if (!id) return;
    const accesstoken = storage.get(storage.keys.accessToken, true);
    const fetchData = {
      mdrender: false
    };
    if (accesstoken) {
      Object.assign(fetchData, { accesstoken });
    }

    wx.fetch({
      url: `${apis.topicDetail}/${id}`,
      data: fetchData
    }).then(res => {
      if (!res.success) {
        this.setData({ noDataMsg: res.error_msg })
        return;
      }
      const detail = res.data;
      detail.replies.forEach(reply => {
        reply.createTime = util.transformDateTime(new Date(reply.create_at));
      })
      detail.createTime = util.formateDate(new Date(detail.create_at)); // 发布时间
      detail.lastReplyTime = util.formateDate(new Date(detail.last_reply_at)); // 最后回复时间
      this.setData({
        detail
      });

      // 设置分享参数
      this.updateShareMessage({
        title: app.shareInfo.title,
        path: `/pages/article/list?tab=${detail.tab || 'all'}&homeToPage=${encodeURIComponent(`/pages/article/detail?id=${id}`)}`
      });
      // this.setData({ navTitle: detail.title }); // 设置页面标题
    });
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
  // 评论
  toReply(e) {
    const { type, replyid, preauthor } = e.currentTarget.dataset;
    // type => create/replyDetail/replyComment
    // console.log(`/pages/article/post?type=${type}&articleId=${this.detailId}${replyid ? `&replyId=${replyid}` : ''}`)
    wx.safeNavigateTo({
      url: `/pages/article/post?type=${type}&articleId=${this.detailId}${replyid ? `&replyId=${replyid}&preauthor=${preauthor}` : ''}`
    })
  },
  // 快速发帖
  toPost() {
    wx.safeNavigateTo({
      url: '/pages/article/post?type=create'
    })
  },
  toggleCollect() {
    const accesstoken = storage.get(storage.keys.accessToken, true);
    if (!accesstoken) {
      wx.showModal({
        title: '登录提示',
        content: '收藏前必须登录, 是否立即登录?',
        success(res) {
          if (res.confirm) {
            wx.safeNavigateTo({
              url: '/pages/personal/personal'
            })
          } else if (res.cancel) {
            // console.log('用户点击取消');
          }
        }
      })
      return;
    }
    const {
      is_collect: isCollect,
      id
    } = this.data.detail;
    let fetchUrl = apis.topicCollectAdd;
    if (isCollect) {
      fetchUrl = apis.topicCollectDel;
    }
    wx.fetch({
      url: fetchUrl,
      method: 'POST',
      data: {
        topic_id: id,
        accesstoken
      }
    }).then(res => {
      if (res.success) {
        this.setData({
          ['detail.is_collect']: !isCollect
        });
        wx.showToast({
          title: isCollect ? '已取消收藏' : '已收藏'
        })
      } else {
        wx.showToast({
          title: isCollect ? '文章已取消收藏' : '文章已收藏'
        })
      }
    })
  }
})
