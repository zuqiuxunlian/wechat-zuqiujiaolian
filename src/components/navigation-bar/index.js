const app = getApp();
const { statusBarHeight, system, windowWidth } = wx.getSystemInfoSync();
const isIOS = /^ios/i.test(system);

function calcMaxWidth(windowWidth, isIOS) {
  const left = isIOS ? 7 : 10;
  const capsuleWidth = 43 * 2 + 1;
  const padding = isIOS ? 0 : 5;
  const total = (left + capsuleWidth + padding * 2) * 2;

  // `- 10` 是为了两边留出一点空白
  const maxWidth = windowWidth - total - 10;
  return maxWidth;
}

Component({
  options: {
    multipleSlots: true
  },
  properties: {
    /**
     * 导航标题
     */
    title: {
      type: String,
      value: '未命名标题',
      observer(newTitle) {
        this.setData({
          title: newTitle
        });
      }
    },
    /**
     * 返回页面数
     */
    delta: {
      type: Number,
      value: 1
    },
    /**
     * 是否展示 home 按钮
     */
    showHome: {
      type: Boolean,
      value: true
    },
    /**
     * 是否隐藏返回按钮
     */
    hideBack: {
      type: Boolean,
      value: false
    },
    /**
     * 导航背景色
     */
    bgColor: {
      type: String,
      value: 'white'
    },
    /**
     * 导航文本样式 light/dark
     */
    textStyle: {
      type: String,
      value: 'dark',
      observer(newStyle) {
        if (!this.properties.autoCapsule) return;
        if (newStyle === 'light') {
          wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#000000',
            animation: {}
          });
        } else {
          wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#ffffff',
            animation: {}
          });
        }
      },
    },
    /**
     * 是否根据 textStyle 自动更改微信原生胶囊的样式
     */
    autoCapsule: {
      type: Boolean,
      value: true
    },
    /**
     * 是否由内容自动撑开高度
     * 为 `false` 时，会设置 `height: 100%`，请注意给父组件设置高度
     */
    autoHeight: {
      type: Boolean,
      value: true
    },
    // 是否是胶囊样式/扁平样式
    capsule: {
      type: Boolean,
      value: false
    },
    // 透明度
    opacity: {
      type: Number,
      value: 1
    },
    // 阻止点击回到首页默认事件
    preventHome: { type: Boolean, value: false },
    preventBack: { type: Boolean, value: false },
    // 是否显示自定义导航
    hideNav: {
      type: Boolean,
      value: false
    }
  },
  data: {
    isIOS,
    justOnePage: true,
    barHeight: +statusBarHeight,
    refresh: true,
    maxWidth: calcMaxWidth(windowWidth, isIOS)
  },
  lifetimes: {
    attached() {
      this._init();
    }
  },
  attached() {
    this._init();
  },
  methods: {
    _init() {
      this.navigationData = getNavigationData();
      this.homePath = (app.appConfig && app.appConfig.appHomePath) || '/pages/index/index';
      const pages = getCurrentPages();
      this.setData({
        justOnePage: pages.length === 1
      });

      // 刷新一下导航条结构
      // 使得该部分的 cover-view 层级高于页面内容的原生组件
      setTimeout(() => {
        this.refreshNavigation();
      }, 100);
    },

    /**
     * 刷新导航条 (切换两个完全相同的导航显示与隐藏)
     *
     * 通过该刷新操作，来达到覆盖页面原生组件的目的
     *
     * 原理：
     * 1. cover-view 可以覆盖原生组件
     * 2. 后渲染的原生组件层级更高
     */
    refreshNavigation() {
      const { refresh } = this.data;
      this.setData({
        refresh: !refresh
      });
    },
    /**
     * 点击返回按钮
     */
    _handleNavBack() {
      const detail = {};
      this.triggerEvent('back', detail);
      const { preventBack, delta } = this.properties;
      if (preventBack) return;
      wx.navigateBack({ delta });
    },

    /**
     * 点击首页按钮
     */
    _handleNavHome() {
      const detail = {};
      this.triggerEvent('home', detail);
      if (this.properties.preventHome) return;
      const { homePath } = this;
      if (homePath) {
        wx.switchTab({
          url: homePath,
          fail() {
            wx.reLaunch({
              url: homePath
            });
          }
        });
      }
    },
    /**
     * 点击标题
     */
    tapTitle() {
      const myEventDetail = {} // detail对象，提供给事件监听函数
      const myEventOption = {} // 触发事件的选项
      this.triggerEvent('titletap', myEventDetail, myEventOption)
    }
  }
});


// 获取自定义导航部分数据: 单位px
function getNavigationData() {
  const {
    statusBarHeight,
    system,
    windowWidth,
    windowHeight
  } = wx.getSystemInfoSync();
  const isIOS = /^ios/i.test(system);
  const barTitleHeight = isIOS ? 44 : 48;

  const calcMaxWidth = () => {
    const left = isIOS ? 7 : 10;
    const capsuleWidth = 43 * 2 + 1;
    const padding = isIOS ? 0 : 5;
    const total = (left + capsuleWidth + padding * 2) * 2;

    // `-10` 两边留出部分空白
    return windowWidth - total - 10;
  }

  return {
    windowWidth, // 页面宽度
    windowHeight, // 页面高度
    statusBarHeight, // 状态栏高度
    capsuleWidth: 43 * 2 + 1, // 胶囊宽度
    barTitleHeight, // 标题栏高度
    barTitleMaxWidth: calcMaxWidth(windowWidth, isIOS), // 标题栏最大宽度(文字够多显示...)
    barTopHeight: statusBarHeight + barTitleHeight, // 标题栏下边界距离屏幕最顶部距离(含状态栏高度)
  }
}