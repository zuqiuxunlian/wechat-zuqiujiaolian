const apis = require('../../lib/apis');
const util = require('../../lib/util');
const storage = require('../../lib/storage');
const { barTitleHeight, windowHeight } = util.getNavigationData();

const app = getApp();

Page({
  data: {
    opacity: 0,
    topHeight: barTitleHeight * 2, // 导航距离顶部高度
    isRealScroll: false, // 滚动状态

    list: [], // 内容列表
    loadingStatus: true, // loading状态
    noMoreData: false, // 没有更多数据了(最后一页)
    tabName: '', // 分类名称
    publishBtnStatus: false, // 是否展示回帖

    authDeny: false,
    userInfo: null,
    hasAuthorization: false
  },
  onShow() {
    this.setData({ authDeny: false });
    this.initUserAuthStatus();

    this.setData({
      publishBtnStatus: app.globalData.hasPost || false,
    })
  },
  onShareAppMessage() {
    return {
      title: app.shareInfo.title,
      path: `/pages/article/list`
    }
  },
  onLoad(option) {
    // 检查用户是否登录
    storage.get(storage.keys.userInfo).then(user => {
      if (user) {
        this.setData({
          userInfo: user
        })
      } else {
        this.initUserAuthStatus();
        this.getLoginCode().then(code => {
          if (code) this.loginCode = code;
        })
      }
    })

    const {
      homeToPage,
      tab
    } = option;
    if (tab === 'news') {
      this.tab = 'news';
      this.setData({ tabName: 'news' });
      this.updateShareMessage({
        title: app.shareInfo.title,
        path: `/pages/article/list?tab=news`
      })
    } else {
      this.tab = tab || storage.get(storage.keys.listtab, true) || 'all';
      storage.set(storage.keys.listtab, this.tab);
      this.setData({
        tabName: util.tabToWord(this.tab) || ''
      });
    }

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

    if (scrollTop < barTitleHeight * 4) {
      let newOpacity = +((scrollTop / barTitleHeight).toFixed(4));
      if (obj.scrollTop <= 0) newOpacity = 0;
      else if (scrollTop > barTitleHeight) newOpacity = 1;
      this.setData({
        opacity: newOpacity
      })
    }

    // 卡片列表动画(超出一屏启用动画)
    // console.log(app.appConfig.listRotateAnimation);
    if (app.appConfig.listRotateAnimation && scrollTop > windowHeight) {
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
      itemList: Object.keys(util.listTabs).map(item => {
        return util.listTabs[item];
      }),
      success: (res) => {
        // 回到顶部
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 400
        });
        const tab = Object.keys(util.listTabs)[res.tapIndex];
        if (tab !== this.tab) {
          this.page = 1;
          this.limit = 10;
          this.tab = tab;
          this.setData({
            tabName: util.tabToWord(tab) || ''
          });
          storage.set(storage.keys.listtab, tab); // 本地存储
          this.updateShareMessage({
            // title: `${this.data.tabName}`,
            title: app.shareInfo.title,
            path: `/pages/article/list?tab=${tab}`
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
    if (this.page === 1) {  // 第一页刷新数据请求
      this.setData({
        noMoreData: false
      })
    }
    if (this.data.noMoreData) return; // 已经到最后一页, 不重复请求
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
      // 第一页刷新数据缓存
      if (this.page === 1) {
        this.setData({
          list: []
        })
      };
      const length = this.data.list.length;
      const resObj = {};

      // 请求到了最后一页
      if (res.data.length < this.limit) {
        this.setData({
          loadingStatus: false,
          noMoreData: true
        });
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
      url: `/pages/article/detail?from=list&id=${item.id}`
    })
  },
  // 更新页面分享参数
  updateShareMessage(shareInfo) {
    this.onShareAppMessage = () => shareInfo;
  },
  // 跳转“关于”页面
  toAbout() {
    wx.navigateTo({
      url: `/pages/lib/lib`
    })
  },
  // 回到首页
  toHome() {
    wx.switchTab({
      url: `/pages/index/index`
    })
  },
  // 快速发帖
  toPost() {
    if (this.data.userInfo) {
      wx.safeNavigateTo({
        url: '/pages/article/post?type=create'
      })
    } else {
      wx.showModal({
        title: '登录提醒',
        content: '您需要登录后才能发帖， 是否立即登录?',
        success: (res) => {
          if (res.confirm) {
            const currentUrl = util.getCurrentUrl();
            wx.redirectTo({
              url: `/pages/login/login?callbackUrl=${encodeURIComponent(currentUrl)}`
            })
          } else if (res.cancel) {
            // console.log('用户点击取消');
          }
        }
      })
    }
  },




  // ====== 授权登录发帖 ====
  // 用户登录, 获取并存储token; 根据token获取用户信息
  login(data) {
    return wx.fetch({
      url: apis.login,
      method: 'POST',
      data
    }).then(res => {
      if (res && res.success) {
        storage.set(storage.keys.authToken, res.data);
        this.getUserInfoByAuth(res.data);
      }
    })
  },
  // 根据 token 或 accesstoken 获取用户信息;
  // type取值: 'token'或'accesstoken'
  getUserInfoByAuth(code, type = 'token') {
    const url = `${apis.userinfo}?${type}=${code}`;
    wx.fetch({
      url,
      method: 'GET',
      data: {}
    }).then(res => {
      if (res && res.success) {
        storage.set(storage.keys.userInfo, res.data);
        storage.set(storage.keys.accessToken, res.data.accessToken);
        this.setData({
          userInfo: res.data
        });
        this.toPost();
      }
    })
  },
  // 用户授权登录
  handleUserInfoBtn(e) {
    if (!e.detail || !e.detail.userInfo) {
      this.setData({ authDeny: true })
      return;
    }
    this.setData({ authDeny: false });

    if (this.loginCode) {
      this.login({
        code: this.loginCode,
        authInfo: e.detail
      });
    } else {
      console.error('Login Error, loginCode获取失败');
    }
  },
  // 获取用户授权状态
  initUserAuthStatus() {
    wx.getSetting({
      success: (res) => {
        this.setData({
          hasAuthorization: !!res.authSetting['scope.userInfo'],
        })
      }
    })
  },
  // 获取登录code
  getLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (data) => {
          if (data.code) {
            resolve(data.code);
          } else {
            resolve(null);
          }
        }
      })
    })
  }
  // ====== End 授权登录发帖 ====
})
