// 初始化用户资料云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/iaiam7P5IgL4ST06qRGpAy4tLZuUcpZDliaCpxw6ianL7Q1BiciaF4ickggFKPvTLibIyjTQJeJWGDRc0icia07Rmic9XGTZw/0';

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
    }

    return { code: 0, message: 'ok', data: userRecord };
  } catch (err) {
    console.error('initUserProfile error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
