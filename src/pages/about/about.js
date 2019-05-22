const storage = require('../../lib/storage');
const app = getApp();

Page({
  data: {
    version: app.version,
    clubs: [
      'https://static.zuqiuxunlian.com/public/images/over_seas_fc_128.png',
      'https://static.zuqiuxunlian.com/public/images/huaining_sailing_128.png',
      'https://static.zuqiuxunlian.com/public/images/yiqiti_128.png',
      'https://static.zuqiuxunlian.com/public/images/co_beijixing_128.png',
      'https://static.zuqiuxunlian.com/public/images/co_wpxf_128.png',
      'https://static.zuqiuxunlian.com/public/images/co_hubei_jx_128.png',
      'https://static.zuqiuxunlian.com/public/images/co_juli_128.png',
      'https://static.zuqiuxunlian.com/public/images/co_lgfc_128.png'
    ]
  },
  onLoad() {
  },
  onShareAppMessage() {
    return {
      title: '足球教练社区',
      path: '/pages/index/index',
      imageUrl: 'https://static.zuqiuxunlian.com/16cc9b1362fe39cf91babbbd0bed22c9.jpg'
    }
  },
  // logo预览
  previewClubLogo(e) {
    const { index } = e.currentTarget.dataset;
    wx.previewImage({
      current: this.data.clubs[index],
      urls: this.data.clubs
    })
  },

  // 复制链接
  handleCopyLink(e) {
    const { info } = e.currentTarget.dataset;
    if (info) {
      wx.setClipboardData({
        data: info,
        success: (res) => {
          wx.showToast({
            title: '复制成功',
            icon: 'none'
          })
        }
      })
    }
  },

  // 申请加入logo
  toAddClub(){
    wx.safeNavigateTo({
      url: `/pages/article/detail?id=5c22ea5471079f5083004bc7`
    })
  }
})
