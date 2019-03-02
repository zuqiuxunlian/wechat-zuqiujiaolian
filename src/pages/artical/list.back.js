const apis = require('../../lib/apis');
const util = require('../../lib/util');

const { statusBarHeight, system, windowWidth, windowHeight } = wx.getSystemInfoSync();
const isIOS = /^ios/i.test(system);

Page({
  data: {
    isIOS,
    bgOpacity: 0, // 导航背景色
    barHeight: statusBarHeight,
    barTitleMaxWidth: calcMaxWidth(windowWidth, isIOS),

    isRealScroll: false,

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

    // 分享页重定向跳转: path需要 encode !!!
    if (homeToPage) {
      wx.navigateTo({
        url: decodeURIComponent(homeToPage)
      })
    }
  },
  onUnload() {
    clearInterval(this.scrollFinishTimer);
    clearTimeout(this.pageScrollNavTimer);
    clearTimeout(this.pageScrollTimer);
  },
  touchStart() { this.touchStartStatus = true; },
  touchEnd() { this.touchStartStatus = false; },
  // page scrollEnd判断
  setScrollFinishTimer() {
    this.scrollFinishTimer = setInterval(() => {
      if (!this.animateScroll && !this.touchStartStatus && this.data.isRealScroll) {
        clearInterval(this.scrollFinishTimer);
        this.scrollFinishTimer = null;
        this.setData({ isRealScroll: false });
      }
    }, 90);
  },
  // 定时器创建
  setPageScrollTimer(fn, time) {
    return setTimeout(() => {
      fn();
    }, time || 300);
  },
  // 页面滚动
  onPageScroll(obj) {
    // 标题透明度设置
    const scrollTop = obj.scrollTop;

    // 顶部自定义导航样式设置
    if (this.animateScrollBar) {
      clearTimeout(this.pageScrollNavTimer);
      this.pageScrollNavTimer = this.setPageScrollTimer(() => {
        this.animateScrollBar = false;
      }, 10);
      return;
    };
    this.animateScrollBar = true;
    this.pageScrollNavTimer = this.setPageScrollTimer(() => {
      this.animateScrollBar = false;
    }, 10);

    const baseHeight = isIOS ? 44 : 48;
    if (scrollTop < baseHeight * 4) {
      let newOpacity = +((scrollTop / baseHeight).toFixed(4));
      if (obj.scrollTop <= 0) newOpacity = 0;
      else if (scrollTop > baseHeight) newOpacity = 1;
      this.setData({
        bgOpacity: newOpacity
      })
    }


    // 卡片列表动画(超出一屏启用动画)
    if (scrollTop > windowHeight) {
      if (this.animateScroll) {
        clearTimeout(this.pageScrollTimer);
        this.pageScrollTimer = this.setPageScrollTimer(() => {
          this.animateScroll = false;
        });
        return;
      };
      this.animateScroll = true;
      this.pageScrollTimer = this.setPageScrollTimer(() => {
        this.animateScroll = false;
      });

      if (!this.scrollFinishTimer) this.setScrollFinishTimer();
      if (!this.data.isRealScroll) this.setData({ isRealScroll: true })
    }
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
    this.getLists(() => {
      wx.stopPullDownRefresh();
    });
    setTimeout(() => { wx.stopPullDownRefresh(); }, 4000);
  },

  noop() {},
  // 切换分类
  changeTab() {
    wx.showActionSheet({
      itemList: ['全部', '精选', '问答', '分享', '招聘'],
      success: (res) => {
        // 回到顶部
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 400
        });

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
  // 更新页面分享参数
  updateShareMessage(shareInfo) {
    this.onShareAppMessage = () => shareInfo;
  }
})


function calcMaxWidth(w, isIOS) {
  const left = isIOS ? 7 : 10;
  const capsuleWidth = 43 * 2 + 1;
  const padding = isIOS ? 0 : 5;
  const total = (left + capsuleWidth + padding * 2) * 2;

  // `- 10` 是为了两边留出一点空白
  const maxWidth = w - total - 10;
  return maxWidth;
}