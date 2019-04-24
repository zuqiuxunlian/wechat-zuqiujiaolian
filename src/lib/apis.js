// !!! 发布之前注意改为: isTestEnv = false
// true => 测试环境, false => 生产环境
const isTestEnv = true;
let DOMAIN = 'https://bbs.zuqiuxunlian.com';

if (isTestEnv) {
  DOMAIN = 'https://bbt.zuqiuxunlian.com';
}

module.exports = {
  topics: `${DOMAIN}/api/v1/topics`, // 帖子列表
  reply: `${DOMAIN}/api/v1/topic`, // 评论 :topic_id/replies
  topicDetail: `${DOMAIN}/api/v1/topic`, //帖子详情
  login: `${DOMAIN}/api/v1/user/weixin/login`, // 用户登录
  userinfo: `${DOMAIN}/api/v1/me`, // 用户信息(获取&修改)
  changePassword: `${DOMAIN}/api/v1/me/change_password`, // 密码修改
  uploadToken: `${DOMAIN}/api/v1/upload_token`, // 获取七牛上传token
  appConfig: `${DOMAIN}/api/v1/weapp_config`, // 小程序后台配置

  // accesstoken: `${DOMAIN}/api/v1/accesstoken`, // 验证用户accesstoken
  // userDetail: `${DOMAIN}/api/v1/user`, // 用户详情 => /user/:loginname
  // topicCollectAdd: `${DOMAIN}/api/v1/topic_collect/collect`, // 收藏
  // topicCollectDel: `${DOMAIN}/api/v1/topic_collect/de_collect`, // 取消收藏
  // topicCollect: `${DOMAIN}/api/v1/topic_collect`, // 收藏列表
  // msgCount: `${DOMAIN}/api/v1/message/count`, // 未读消息
  // allMsg: `${DOMAIN}/api/v1/messages`, // 获取已读和未读消息
  // markAllMsg: `${DOMAIN}/api/v1/message/mark_all`, // 标记全部已读
  // markMsg: `${DOMAIN}/api/v1/message/mark_one/:msg_id`, // 标记单个消息为已读 => message/mark_one/:msg_id
}
