const { getCurrentUrl } = require('./util');

// 参考地址: https://developers.weixin.qq.com/miniprogram/dev/api/wx.request.html
const fetch = (options) => {
  const {
    url,
    data, // 数据类型: string/object/ArrayBuffer
    header = {},
    method = 'GET', // 合法值: OPTIONS / GET / HEAD / POST / PUT / DELETE / TRACE / CONNECT
    dataType = 'json', // 合法值: json(返回的数据为 JSON，返回后会对返回的数据进行一次 JSON.parse) / 其他(不对返回的内容进行 JSON.parse)
    responseType = 'text', // 合法值: text / arraybuffer
  } = options;

  return new Promise((resolve, reject) => {
    if (!url) resolve('请求URL错误');
    console.log(header)
    wx.request({
      url,
      data,
      header: Object.assign({
        'content-type': 'application/json'
      }, header),
      method,
      dataType,
      responseType,
      success(res) {
        // 服务器错误
        if (+res.statusCode === 500) {
          wx.showToast({
            title: '服务器错误, 请重试',
            icon: 'none'
          })
          return;
        }

        // 用户未登录, 跳转个人中心登录然后返回
        if (+res.statusCode === 401) {
          const currentUrl = getCurrentUrl();
          wx.redirectTo({
            url: `/pages/login/login?callbackUrl=${encodeURIComponent(currentUrl)}`
          })
          return;
        }
        if (res.data) resolve(res.data);
        else resolve(res);
      },
      fail(error) {
        console.error(`wx.fetch Error`);
        console.error(error);
        reject(error);
      },
      complete() {}
    })
  });
}

module.exports = fetch;