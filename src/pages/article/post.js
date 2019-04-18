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

    pageType: 'post', // post: 发帖; replyDetail: 评论
    contentFocus: false, // 内容输入框是否获取焦点
  },
  onLoad(options){
    const { type, id } = options;
    if (type === 'replyDetail') {
      this.setData({
        pageType: 'replyDetail',
        navTitle: '话题评论',
      });
    }
  },
  changeTab() {
    console.log('点击')
    wx.showActionSheet({
      itemList: Object.keys(util.listTabs).map(item => {
        return util.listTabs[item];
      }),
      success: (res) => {
        // wx.pageScrollTo({
        //   scrollTop: 0,
        //   duration: 400
        // });
        const tab = Object.keys(util.listTabs)[res.tapIndex];
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
    // wx.fetch({
    //   url: apis.uploadToken
    // }).then(res => {
    //   if (res.success) {}
    // })

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
        const tempFilePaths = res.tempFilePaths; //选择了多张图片，但由于上传七牛云是单张上传，因此需要循环调接口，注意是调两个接口，获取直传token和七牛直传的接口
        tempFilePaths.map((img, index) => {
          qiniuUploader.upload(img, (data) => {
            console.log(data);
            if (!/^https?:\/\//.test(data.imageURL)) {
              data.imageURL = `https://${data.imageURL}`;
            }
            const imageUrls = this.data.imageUrls;
            imageUrls.push(data.imageURL);
            this.setData({ imageUrls });
            this.setTimeout(() => {
              wx.hideLoading();
            }, 200);
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
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    console.log(`输入${field}: ${value}`);
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

  }
})
