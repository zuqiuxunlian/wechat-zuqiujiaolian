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
  formateDate: (datetime) => {
    const dt = datetime ? new Date(datetime) : new Date();
    const year = dt.getFullYear();
    const month = fillZero(dt.getMonth() + 1);
    const day = fillZero(dt.getDate());

    const h = fillZero(dt.getHours());
    const m = fillZero(dt.getMinutes());
    const s = fillZero(dt.getSeconds());
    return `${year}-${month}-${day} ${h}:${m}:${s}`;
  },

  // 日期时间转换
  transformDateTime: (atime) => {
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
    return sb.join('') + '前';
  },

  // 帖子分类 tab转意
  tabToWord: (tab) => {
    let result = '';
    switch (tab) {
      case 'good':
        result = '精选';
        break;
      case 'ask':
        result = '问答';
        break;
      case 'share':
        result = '分享';
        break;
      case 'job':
        result = '招聘';
        break;
      default:
        result = '全部分类';
        break;
    }
    return result;
  }
}

module.exports = util;
