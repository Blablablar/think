// 初始化用户资料云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 云存储中的默认头像 fileID
const DEFAULT_AVATAR = 'cloud://cloud1-2gt03efv3c08ce28.636c-cloud1-2gt03efv3c08ce28-1256535077/assets/default-avatar.png';

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();

    // 查询 users 集合中是否存在当前 openid 的记录
    const userResult = await db.collection('users').where({ _openid: OPENID }).get();

    let userRecord;
    if (userResult.data.length === 0) {
      // 不存在则插入新记录
      const newUser = {
        nickName: '微信用户',
        avatarUrl: DEFAULT_AVATAR,
        createdAt: new Date()
      };
      const addResult = await db.collection('users').add({ data: newUser });
      userRecord = {
        _id: addResult._id,
        _openid: OPENID,
        ...newUser
      };
    } else {
      userRecord = userResult.data[0];
      // 修复旧用户的无效头像 URL（mmbiz.qpic.cn 已失效）
      if (!userRecord.avatarUrl || userRecord.avatarUrl.indexOf('mmbiz.qpic.cn') !== -1) {
        await db.collection('users').doc(userRecord._id).update({
          data: { avatarUrl: DEFAULT_AVATAR }
        });
        userRecord.avatarUrl = DEFAULT_AVATAR;
      }
    }

    return { code: 0, message: 'ok', data: userRecord };
  } catch (err) {
    console.error('initUserProfile error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
