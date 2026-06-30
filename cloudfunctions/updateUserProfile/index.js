// 更新用户资料云函数（upsert：不存在则插入，存在则更新）
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 云存储中的默认头像 fileID
const DEFAULT_AVATAR = 'cloud://cloud1-2gt03efv3c08ce28.636c-cloud1-2gt03efv3c08ce28-1256535077/assets/default-avatar.png';

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const { nickName, avatarUrl } = event;

    const updateData = {};
    if (nickName !== undefined) {
      updateData.nickName = nickName;
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }
    updateData.updatedAt = new Date();

    // 先查询是否存在该 _openid 的记录
    const existRes = await db.collection('users').where({ openid: OPENID }).get();

    let result;
    if (existRes.data.length === 0) {
      // 不存在则插入新记录（带 _openid）
      const newUser = {
        _openid: OPENID,
        openid: OPENID,
        nickName: nickName !== undefined ? nickName : '微信用户',
        avatarUrl: avatarUrl !== undefined ? avatarUrl : DEFAULT_AVATAR,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const addRes = await db.collection('users').add({ data: newUser });
      result = { _id: addRes._id, stats: { updated: 1 }, created: true };
    } else {
      // 存在则更新
      result = await db.collection('users')
        .where({ openid: OPENID })
        .update({ data: updateData });
      result = { ...result, created: false };
    }

    return { code: 0, message: 'ok', data: { ...result, version: 'upsert-v2' } };
  } catch (err) {
    console.error('updateUserProfile error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
