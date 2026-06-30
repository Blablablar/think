// 标签浏览云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const tag = event.tag;
    const page = event.page || 1;
    const pageSize = event.pageSize || 10;
    const skip = (page - 1) * pageSize;

    if (!tag) {
      return { code: -1, message: 'tag is required', data: null };
    }

    // 使用 _.in([tag]) 过滤 tags 数组
    const where = { tags: _.in([tag]) };

    // 统计总量
    const countResult = await db.collection('creativities').where(where).count();
    const total = countResult.total;

    // 查询创意列表（用 where + get 代替 aggregate）
    const listResult = await db.collection('creativities')
      .where(where)
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
    console.error('getTagCreativities error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
