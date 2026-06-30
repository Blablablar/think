// 初始化/更新用户资料云函数
// 使用自定义 openid 字段（不带下划线）作为用户标识
// 原因：云函数中 _openid 是系统保留字段，add() 不会自动写入，手动写入也可能失败
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 云存储中的默认头像 fileID
const DEFAULT_AVATAR = 'cloud://cloud1-2gt03efv3c08ce28.636c-cloud1-2gt03efv3c08ce28-1256535077/assets/default-avatar.png';

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const { nickName, avatarUrl } = event || {};

    // 用自定义 openid 字段查询（不带下划线，可正常读写）
    const userResult = await db.collection('users').where({ openid: OPENID }).get();

    let userRecord;
    if (userResult.data.length === 0) {
      // 不存在则插入新记录
      const newUser = {
        openid: OPENID,
        nickName: nickName || '微信用户',
        avatarUrl: avatarUrl || DEFAULT_AVATAR,
        createdAt: new Date()
      };
      const addResult = await db.collection('users').add({ data: newUser });
      userRecord = {
        _id: addResult._id,
        openid: OPENID,
        nickName: newUser.nickName,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt
      };
    } else {
      userRecord = userResult.data[0];
      // 计算需要更新的字段
      const updateData = {};
      // 修复旧用户的无效头像 URL（mmbiz.qpic.cn 已失效）
      if (!userRecord.avatarUrl || userRecord.avatarUrl.indexOf('mmbiz.qpic.cn') !== -1) {
        updateData.avatarUrl = DEFAULT_AVATAR;
      }
      // 如果传入了新的 nickName/avatarUrl，则更新
      if (nickName !== undefined && nickName) {
        updateData.nickName = nickName;
      }
      if (avatarUrl !== undefined && avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      }
      // 有字段需要更新时才执行 update
      if (Object.keys(updateData).length > 0) {
        await db.collection('users').doc(userRecord._id).update({ data: updateData });
        Object.assign(userRecord, updateData);
      }
    }

    return { code: 0, message: 'ok', data: userRecord, version: 'v4-custom-openid' };
  } catch (err) {
    console.error('initUserProfile error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
