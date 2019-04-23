const util = {
  // 前置补0
  fillZero: (num, len = 2) => {
    num = `${num}`;
    if (num.length >= len) return num;

    const arr = [];
    const originNum = num.split('').reverse();
    for (let index = 0; index < len; index++) {
      arr.push(originNum[index] || '0');
    }
    return arr.reverse().join('');
  },

  // 日期格式化  yyyy-mm-dd hh:mm:ss
  formateDate(datetime) {
    const dt = datetime ? new Date(datetime) : new Date();
    const year = dt.getFullYear();
    const month = this.fillZero(dt.getMonth() + 1);
    const day = this.fillZero(dt.getDate());

    const h = this.fillZero(dt.getHours());
    const m = this.fillZero(dt.getMinutes());
    const s = this.fillZero(dt.getSeconds());
    return `${year}-${month}-${day} ${h}:${m}:${s}`;
  },

  // 日期时间转换
  transformDateTime(atime) {
    const byTime = [365 * 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, 60 * 60 * 1000, 60 * 1000, 1000];
    const unit = ['年', '天', '小时', '分钟', '秒钟'];

    let ct = new Date().getTime() - atime.getTime();
    if (ct < 0) return '参数错误';

    const sb = [];
    for (let i = 0; i < byTime.length; i++) {
      if (ct < byTime[i]) {
        continue;
      }
      const temp = Math.floor(ct / byTime[i]);
      ct = ct % byTime[i];
      if (temp > 0) {
        sb.push(temp + unit[i]);
      }

      /*一下控制最多输出几个时间单位：
      	一个时间单位如：N分钟前
      	两个时间单位如：M分钟N秒前
      	三个时间单位如：M年N分钟X秒前
      以此类推
      */
      if (sb.length >= 1) {
        break;
      }
    }
    return sb.join('') ? `${sb.join('')}前` : `刚刚`;
  },

  // 帖子版块
  listTabs: {
    'all': '全部',
    'good': '精华',
    'share': '分享',
    'ask': '问答',
    'exp': '心得',
    // 'news': '新闻',
    'job': '招聘',
    //'dev': '测试客户端',
    //'atch': '约赛',
  },
  // 帖子分类 tab转意
  tabToWord: function (tab) {
    return this.listTabs[tab] || '全部';
  },

  // 获取自定义导航部分数据: 单位px
  getNavigationData() {
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
      contentHeight: windowHeight - (statusBarHeight + barTitleHeight), // 页面内容高度
    }
  }
}

module.exports = util;
