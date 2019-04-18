const util = require('../../lib/util');
const qiniuUploader = require('../../lib/qiniuUploader');
Page({
  data: {
    navTitle: '发布话题',
    detail: null,
    tabName: '全部', // 分类名称
    imageURL: '',

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
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths; //选择了多张图片，但由于上传七牛云是单张上传，因此需要循环调接口，注意是调两个接口，获取直传token和七牛直传的接口
        tempFilePaths.map((img, index) => {
          console.log(img);
          // wx.uploadFile({
          //   url: 'https://bbs.zuqiuxunlian.com/upload', // 仅为示例，非真实的接口地址
          //   filePath: img,
          //   name: 'file',
          //   formData: {
          //     name: `${new Date().getTime()}.jpg`,
          //     file: img,
          //     type: 'image/jpg'
          //   },
          //   success(res) {
          //     console.log('上传成功', res);
          //   }
          // })

          // qiniuUploader.upload(img, (res) => {
          //   console.log(res);
          //   this.setData({
          //     'imageURL': res.imageURL,
          //   });
          // }, (error) => {
          //   console.log('error: ' + error);
          // }, {
          //   uploadURL: 'https://upload.qiniup.com',
          //   domain: 'zuqiuxunlian.com',
          //   uptokenURL: 'https://bbs.zuqiuxunlian.com',
          // })
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
  }
})
