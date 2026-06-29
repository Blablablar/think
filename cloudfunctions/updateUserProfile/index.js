// 更新用户资料云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

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

    const result = await db.collection('users')
      .where({ _openid: OPENID })
      .update({ data: updateData });

    return { code: 0, message: 'ok', data: result };
  } catch (err) {
    console.error('updateUserProfile error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
