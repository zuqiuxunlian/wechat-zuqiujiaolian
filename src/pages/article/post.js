const util = require('../../lib/util');
Page({
  data: {
    navTitle: '发布',
    detail: null,
    tabName: '全部', // 分类名称
  },
  onLoad(){

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
  dianji(){
    console.log('点击输入框')
  }
})
