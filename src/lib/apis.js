const domain = 'https://bbs.zuqiuxunlian.com';

module.exports = {
  topics: `${domain}/api/v1/topics`, // 帖子列表
  topicDetail: `${domain}/api/v1/topic`, //帖子详情

  login: `${domain}/api/v1/userlogin`, // 用户登录*
  accesstoken: `${domain}/api/v1/accesstoken`, // 验证用户accesstoken
  userDetail: `${domain}/api/v1/user`, // 用户详情 => /user/:loginname
  topicCollectAdd: `${domain}/api/v1/topic_collect/collect`, // 收藏
  topicCollectDel: `${domain}/api/v1/topic_collect/de_collect`, // 取消收藏
  topicCollect: `${domain}/api/v1/topic_collect`, // 收藏列表
  msgCount: `${domain}/api/v1/message/count`, // 未读消息
  allMsg: `${domain}/api/v1/messages`, // 获取已读和未读消息
  markAllMsg: `${domain}/api/v1/message/mark_all`, // 标记全部已读
  markMsg: `${domain}/api/v1/message/mark_one/:msg_id`, // 标记单个消息为已读 => message/mark_one/:msg_id
  square: `https://www.frontendjs.com/api/hot_funs/list`,
}
