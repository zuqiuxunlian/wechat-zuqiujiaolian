const storage = require('../../lib/storage');
const apis = require('../../lib/apis');
const util = require('../../lib/util');
const qiniuUploader = require('../../lib/qiniuUploader');

Page({
  data: {
    navTitle: '发布话题',
    detail: null,
    tabName: '全部', // 分类名称
    imageUrls: [],
    pageType: '', // post: 发帖; replyDetail: 评论
    contentFocus: false, // 内容输入框是否获取焦点
  },
  onLoad(options){
    const { type, articleId, replyId, preauthor } = options;
    this.type = type; // create/replyDetail/replyComment
    this.articleId = articleId;
    this.replyId = replyId;
    this.preauthor = preauthor;
    if (type === 'create') {
      this.setData({
        pageType: 'post',
        navTitle: '发布话题',
      });
    } else if (type === 'replyDetail') {
      this.setData({
        pageType: 'replyDetail',
        navTitle: '话题评论',
      });
    }
  },
  changeTab() {
    wx.showActionSheet({
      itemList: Object.keys(util.listTabs).filter(key => !!(key !== 'good' && key !== 'all')).map(item => {
        return util.listTabs[item];
      }),
      success: (res) => {
        const tab = Object.keys(util.listTabs).filter(key => !!(key !== 'good' && key !== 'all'))[res.tapIndex] || 'all';
        if (tab !== this.tab) {
          this.tab = tab;
          this.setData({
            tabName: util.tabToWord(tab) || ''
          });
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 获取七牛云token
  // 上传图片
  addImage() {
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
        setTimeout(function () {
          wx.hideLoading();
        }, 3600)
        // 选择了多张图片，但由于上传七牛云是单张上传，因此需要循环调接口
        const tempFilePaths = res.tempFilePaths;
        tempFilePaths.map((img, index) => {
          qiniuUploader.upload(img, (data) => {
            if (!/^https?:\/\//.test(data.imageURL)) {
              data.imageURL = `https://${data.imageURL}`;
            }
            const imageUrls = this.data.imageUrls;
            imageUrls.push(data.imageURL);
            this.setData({ imageUrls });
            wx.hideLoading();
          }, (error) => {
            console.log('error: ' + error);
          }, {
            region: 'ECN',
            domain: 'static.zuqiuxunlian.com',
            uptokenURL: `${apis.uploadToken}?accesstoken=${storage.get(storage.keys.accessToken, true)}`,
          })
        })
      }
    })

  },
  // 用户输入帖子标题/内容
  getTitle(e) {
    const { value } = e.detail;
    this.title = value || '';
  },
  getContent(e) {
    const { value } = e.detail;
    this.content = value || '';
  },
  handleContentFocus(e) {
    this.setData({ contentFocus: true })
  },
  handleContentBlur(e) {
    this.setData({ contentFocus: false })
  },

  // 图片预览
  viewPhoto(e) {
    const { index } = e.currentTarget.dataset;
    const imgs = this.data.imageUrls;
    wx.previewImage({
      current: imgs[index],
      urls: imgs
    })
  },
  // 删除当前图片
  delPhoto(e) {
    wx.showModal({
      title: '删除提示',
      content: '你确定要删除当前当前图片？',
      success: (res) => {
        if (res.confirm) {
          const { index } = e.currentTarget.dataset;
          const imgs = this.data.imageUrls;
          imgs.splice(index, 1);
          this.setData({
            imageUrls: imgs
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })

  },
  // 确定提交发布
  postArticle(){
    const accesstoken = storage.get(storage.keys.accessToken, true);
    let imageStr = '';
    if (this.data.imageUrls.length > 0){
      imageStr = this.data.imageUrls.map(img => {
        return `![${img}](${img})`;
      }).join('\r\n');
    }

    if (!this.type || this.type === 'create') { // 发帖
      this.publishArticle(accesstoken, imageStr);
    } else if (this.type === 'replyDetail' || this.type === 'replyComment') { // 评论
      this.reply(accesstoken, imageStr);
    }
  },

  // 发布帖子
  publishArticle(accesstoken, imageStr) {
    // 如果标题或内容为空
    if(!this.title){
      wx.showToast({
        title: '标题不能为空',
        icon: 'none'
      })
      return;
    }
    if(!this.content){
      wx.showToast({
        title: '发布内容不能为空',
        icon: 'none'
      });
      return;
    }

    wx.fetch({
      url: apis.topics,
      method: 'POST',
      data: {
        accesstoken,
        title: this.title,
        content: `${this.content || ''}\r\n${imageStr || ''}`,
        tab: this.tab
      }
    }).then(res => {
      if (res.success) {
        wx.showModal({
          title: '发布成功',
          content: '帖子已成功发，是否立即查看？',
          confirmText: '立即查看',
          cancelText: '稍后再说',
          success: (data) => {
            if (data.confirm) {
              wx.redirectTo({
                url: `/pages/article/detail?id=${res.topic_id}`
              })
            } else if (data.cancel) {
              wx.navigateBack();
            }
          }
        })
      } else {
        wx.showToast({
          title: res.error_msg,
          icon: 'none'
        });
      }
    })
  },
  // 评论
  reply(accesstoken, imageStr) {
    if(!this.content && !imageStr){
      wx.showToast({
        title: '发布内容不能为空',
        icon: 'none'
      });
      return;
    }
    const url = `${apis.reply}/${this.articleId}/replies`
    const postData = {
      accesstoken,
      content: `${this.preauthor ? '@' + this.preauthor + ' ' : ''}${this.content || ''}\r\n${imageStr}`
    };
    if (this.replyId) {
      Object.assign(postData, { reply_id: this.replyId })
    }

    wx.fetch({
      url,
      method: 'POST',
      data: postData
    }).then(res => {
      if (res.success) {
        wx.showToast({
          title: '评论成功',
          icon: 'success',
          mask: true,
          duration: 1200
        })
        setTimeout(() => {
          wx.reLaunch({
            url: `/pages/article/detail?id=${this.articleId}`
          });
        }, 1300);
      }
    })
  }
})
