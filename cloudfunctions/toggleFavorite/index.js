// 收藏切换云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const creativityId = event.creativityId;
    if (!creativityId) {
      return { code: -1, message: 'creativityId is required', data: null };
    }

    // 查 favorites 集合是否已收藏（_openid + creativityId）
    const existing = await db.collection('favorites')
      .where({ _openid: OPENID, creativityId: creativityId })
      .get();

    if (existing.data.length > 0) {
      // 已收藏则删除记录并 creativities.favoriteCount -1
      const favoriteId = existing.data[0]._id;
      await db.collection('favorites').doc(favoriteId).remove();
      await db.collection('creativities').doc(creativityId).update({
        data: { favoriteCount: _.inc(-1) }
      });
      return { code: 0, message: 'ok', data: { isFavorited: false } };
    } else {
      // 未收藏则插入记录并 creativities.favoriteCount +1
      await db.collection('favorites').add({
        data: {
          creativityId: creativityId,
          createdAt: new Date()
        }
      });
      await db.collection('creativities').doc(creativityId).update({
        data: { favoriteCount: _.inc(1) }
      });
      return { code: 0, message: 'ok', data: { isFavorited: true } };
    }
  } catch (err) {
    console.error('toggleFavorite error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
