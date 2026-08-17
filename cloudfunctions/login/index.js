/**
 * 云函数 - 用户登录
 * 获取微信 openid（相当于用户在小程序里的唯一编号），
 * 并把用户资料自动写入 users 集合（首次登录 = 自动注册）
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // 登录即自动写入/更新用户表（开通云开发后生效）
  try {
    const users = db.collection('users');
    const exist = await users.where({ openid }).get();
    const profile = {
      nickName: (event && event.nickName) || '',
      avatarUrl: (event && event.avatarUrl) || ''
    };
    if (!exist.data.length) {
      // 首次登录 → 自动注册
      await users.add({
        data: {
          openid,
          nickName: profile.nickName,
          avatarUrl: profile.avatarUrl,
          createTime: new Date(),
          lastLoginTime: new Date()
        }
      });
    } else {
      // 老用户 → 更新资料和登录时间
      await users.doc(exist.data[0]._id).update({
        data: {
          lastLoginTime: new Date(),
          nickName: profile.nickName || exist.data[0].nickName || '',
          avatarUrl: profile.avatarUrl || exist.data[0].avatarUrl || ''
        }
      });
    }
  } catch (e) { /* users 集合不存在时忽略，首次 add 会自动创建 */ }

  return {
    openid,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID
  };
};
