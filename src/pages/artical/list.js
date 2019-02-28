const apis = require('../../lib/apis');
const util = require('../../lib/util');

Page({
  data: {
    list: [], // 内容列表
    loadingStatus: true, // 显示loading
    tabName: ''
  },
  onShareAppMessage() {
    return {
      title: 'Node随心阅',
      path: `/pages/artical/list`
    }
  },
  onLoad(option) {
    const {
      homeToPage,
      tab
    } = option;
    this.tab = wx.getStorageSync('listtab') || tab || 'all';
    this.setData({
      tabName: util.tabToWord(this.tab)
    });
    this.page = 1;
    this.limit = 10;
    this.getLists();

    // 分享页重定向
    if (homeToPage) {
      wx.navigateTo({
        url: decodeURIComponent(homeToPage)
      })
    }
  },
  // 切换分类
  changeTab() {
    wx.showActionSheet({
      itemList: ['全部分类', '精选', '问答', '分享', '招聘'],
      success: (res) => {
        let tab = '';
        if (res.tapIndex === 1) {
          tab = 'good'
        } else if (res.tapIndex === 2) {
          tab = 'ask'
        } else if (res.tapIndex === 3) {
          tab = 'share'
        } else if (res.tapIndex === 4) {
          tab = 'job'
        } else {
          tab = 'all'
        }

        if (tab !== this.tab) {
          this.page = 1;
          this.limit = 10;
          this.tab = tab;
          this.setData({
            tabName: util.tabToWord(tab)
          });
          wx.setStorage({
            key: 'listtab',
            data: tab
          });
          this.updateShareMessage({
            title: `Node随心阅: ${this.data.tabName}`,
            path: `/pages/artical/list?tab=${tab}`
          })
          this.getLists();
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 获取列表数据
  getLists(callback) {
    wx.fetch({
      url: apis.topics,
      data: Object.assign({
        mdrender: false,
        limit: this.limit,
        page: this.page,
      }, this.tab === 'all' ? {} : {
        tab: this.tab
      })
    }).then(res => {
      if (this.page === 1) this.data.list = [];
      const length = this.data.list.length;
      const resObj = {};

      // 请求到了最后一页
      if (res.data.length < this.limit) {
        this.setData({
          loadingStatus: false
        });
        return;
      }

      res.data.forEach((item, i) => {
        item.date = util.transformDateTime(new Date(item.create_at));
        item.tabText = util.tabToWord(item.tab) || null;
        item.summary = `摘要: ${item.content.split('\r')[0]}...`;
        resObj[`list[${length + i}]`] = item;
      });
      // console.log(resObj);
      this.setData(resObj);
      if (callback && typeof callback === 'function') {
        callback();
      }
    })
  },
  // 跳转详情
  toDetail(event) {
    const {
      item
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/artical/detail?id=${item.id}`
    })
  },
  // 触底加载
  onReachBottom() {
    this.page++;
    this.getLists();
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.page = 1;
    this.limit = 10;
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 5000);
    this.getLists(() => {
      wx.stopPullDownRefresh();
    });
  },
  // 更新页面分享参数
  updateShareMessage(shareInfo) {
    this.onShareAppMessage = () => shareInfo;
  }
})
