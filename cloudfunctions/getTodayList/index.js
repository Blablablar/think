// 获取今日列表云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const page = event.page || 1;
    const pageSize = event.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const today = formatDate(new Date());

    // 先查今日创意数量
    let countResult = await db.collection('creativities').where({ date: today }).count();
    let matchCondition = { date: today };

    if (countResult.total === 0) {
      // fallback 到近 4 天
      const dates = [];
      for (let i = 0; i < 4; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(formatDate(d));
      }
      countResult = await db.collection('creativities').where({ date: _.in(dates) }).count();
      matchCondition = { date: _.in(dates) };

      if (countResult.total === 0) {
        // fallback 到全量
        countResult = await db.collection('creativities').count();
        matchCondition = {};
      }
    }

    const total = countResult.total;

    // 查询创意列表（用 where + get 代替 aggregate）
    const listResult = await db.collection('creativities')
      .where(matchCondition)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    const creativities = listResult.data;

    if (creativities.length === 0) {
      return { code: 0, message: 'ok', data: { list: [], total, hasMore: false } };
    }

    // 批量查询作者信息
    const openids = [...new Set(creativities.map(c => c.openid || c._openid))];
    const authorsResult = await db.collection('users')
      .where({ openid: _.in(openids) })
      .get();
    const authorMap = {};
    authorsResult.data.forEach(u => { authorMap[u.openid] = u; });

    // 批量查询当前用户的点赞记录
    const creativityIds = creativities.map(c => c._id);
    const likesResult = await db.collection('userLikes')
      .where({
        openid: OPENID,
        creativityId: _.in(creativityIds)
      })
      .get();
    const likeMap = {};
    likesResult.data.forEach(l => { likeMap[l.creativityId] = l; });

    // 合并数据
    const list = creativities.map(item => {
      const author = authorMap[item.openid || item._openid] || null;
      const likeInfo = likeMap[item._id] || null;
      return {
        ...item,
        author,
        isLiked: likeInfo ? likeInfo.type === 'like' : false,
        isDisliked: likeInfo ? likeInfo.type === 'dislike' : false
      };
    });

    const hasMore = skip + list.length < total;

    return { code: 0, message: 'ok', data: { list, total, hasMore } };
  } catch (err) {
    console.error('getTodayList error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
