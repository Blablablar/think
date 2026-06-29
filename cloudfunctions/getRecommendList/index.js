// 获取推荐列表云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const shownIds = Array.isArray(event.shownIds) ? event.shownIds : [];
    const pageSize = event.pageSize || 5;

    // 构造排除已看过 _id 的匹配条件
    const matchCondition = shownIds.length > 0 ? { _id: _.nin(shownIds) } : {};

    // 统计总量
    const countResult = await db.collection('creativities').where(matchCondition).count();
    const total = countResult.total;

    if (total === 0) {
      return { code: 0, message: 'ok', data: { list: [], total, hasMore: false } };
    }

    // 用随机 skip 的方式代替 aggregate $sample
    let skip = 0;
    if (total > pageSize) {
      skip = Math.floor(Math.random() * (total - pageSize + 1));
    }

    const listResult = await db.collection('creativities')
      .where(matchCondition)
      .skip(skip)
      .limit(pageSize)
      .get();

    const creativities = listResult.data;

    if (creativities.length === 0) {
      return { code: 0, message: 'ok', data: { list: [], total, hasMore: false } };
    }

    // 批量查询作者信息
    const openids = [...new Set(creativities.map(c => c._openid))];
    const authorsResult = await db.collection('users')
      .where({ _openid: _.in(openids) })
      .get();
    const authorMap = {};
    authorsResult.data.forEach(u => { authorMap[u._openid] = u; });

    // 批量查询当前用户的点赞记录
    const creativityIds = creativities.map(c => c._id);
    const likesResult = await db.collection('userLikes')
      .where({
        _openid: OPENID,
        creativityId: _.in(creativityIds)
      })
      .get();
    const likeMap = {};
    likesResult.data.forEach(l => { likeMap[l.creativityId] = l; });

    // 合并数据
    const list = creativities.map(item => {
      const author = authorMap[item._openid] || null;
      const likeInfo = likeMap[item._id] || null;
      return {
        ...item,
        author,
        isLiked: likeInfo ? likeInfo.type === 'like' : false,
        isDisliked: likeInfo ? likeInfo.type === 'dislike' : false
      };
    });

    return { code: 0, message: 'ok', data: { list, total, hasMore: false } };
  } catch (err) {
    console.error('getRecommendList error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
