module.exports = {
  // 应用中所有需要本次存储的key, 统一集中处理方便排查
  keys: {
    listtab: 'listtab', // 帖子主题
    listRotateAnimation: 'listRotateAnimation', // 首页列表卡片动画是否开启
    readLoc: 'readLoc', // 阅读位置笔记 { id, top }
    accessToken: 'accessToken',  // 用户accessToken
    authToken: 'authToken', // 登录凭证
    userInfo: 'userInfo', // 用户信息
    collections: 'collections', // 用户收藏列表
  },

  // 所有方法默认为异步sync = false
  // (默认为异步)将数据存储在本地缓存中指定的 key 中。会覆盖掉原来该 key 对应的内容。数据存储生命周期跟小程序本身一致，即除用户主动删除或超过一定时间被自动清理，否则数据都一直可用。单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。
  set(key, data, isSync = false) {
    try {
      if (isSync) {
        try {
          wx.setStorageSync(key, data);
        } catch (e) {
          console.error(e);
        }
      } else {
        return new Promise((resolve, reject) => {
          wx.setStorage({
            key,
            data,
            success() {
              resolve(true);
            },
            fail() {
              resolve();
            }
          });
        })
      }
    } catch (error) {
      console.error(`${key}${isSync ? '同步' : '异步'}存储异常`);
    }
  },
  // 从本地缓存中异步获取指定 key 的内容(默认为异步)
  get(key, isSync = false) {
    if (isSync) {
      try {
        return wx.getStorageSync(key) || null;
      } catch (e) {
        console.error(`${key}${isSync ? '同步' : '异步'}获取异常`);
      }
      return null;
    } else {
      return new Promise((resolve, reject) => {
        try {
          wx.getStorage({
            key,
            success(res) {
              resolve(res.data);
            },
            fail(res) {
              resolve(null);
            }
          })
        } catch (e) {
          reject(e);
        }
      })
    }
  },
  // 从本地缓存中移除指定 key
  remove(key, isSync = false) {
    if (isSync) {
      try {
        wx.removeStorageSync(key)
      } catch (e) {
        console.error(e);
      }
    } else {
      return new Promise((resolve, reject) => {
        try {
          wx.removeStorage({
            key,
            success(res) {
              resolve(res.data)
            }
          })
        } catch (e) {
          reject(e);
        }
      })

    }
  },
  // 异步获取当前storage的相关信息(keys/currentSize/limitSize)
  info(isSync = false) {
    if (isSync) {
      try {
        return wx.getStorageInfoSync() || null;
      } catch (e) {
        console.error(e);
      }
    } else {
      return new Promise((resolve, reject) => {
        wx.getStorageInfo({
          success(res) {
            resolve(res)
          },
          fail(e) {
            reject(e)
          }
        })
      })
    }
  },
  // 清理本地数据缓存
  clear(isSync = false) {
    if (isSync) {
      try {
        wx.clearStorageSync()
      } catch (e) {
        console.error(e);
      }
    } else {
      return new Promise((resolve, reject) => {
        wx.clearStorage({
          success() {
            resolve(true)
          },
          fail(e) {
            reject(e)
          }
        });
      })
    }
  }
}
