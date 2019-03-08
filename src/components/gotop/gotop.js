/*
 * @Author: Edwin
 * @Date: 2019-03-06 00:10:51
 * @Last Modified by: aoxiaoqiang
 * @Last Modified time: 2019-03-07 20:48:41
 *
 * 回到顶部
 */
Component({
  properties: {
    // 是否显示
    show: {
      type: Boolean,
      value: true
    },
    // 是否显示
    opacity: {
      type: Number,
      value: 1
    },
    // 阻止默认行为
    preventDefault: {
      type: Boolean,
      value: false
    }
  },
  data: {
    scrollTop: 0,
  },
  methods: {
    // 回到顶部
    goTop() {
      const myEventDetail = {} // detail对象，提供给事件监听函数
      const myEventOption = {} // 触发事件的选项
      this.triggerEvent('gotop', myEventDetail, myEventOption);

      if (!this.properties.preventDefault) {
        const { windowHeight } = wx.getSystemInfoSync();
        // windowHeight 800
        // x ?
        const baseTime = 600;
        wx.pageScrollTo({
          scrollTop: 0,
          duration: this.data.scrollTop ? baseTime/(windowHeight / this.data.scrollTop) : baseTime
        });
      }
    },
    // 更新距离顶部距离
    updateScrollTop(scrollTop) {
      this.setData({ scrollTop });
    }
  }
});
