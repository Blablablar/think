// 我的收藏列表云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const page = event.page || 1;
    const pageSize = event.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // 查 favorites 集合过滤 _openid === OPENID，按 createdAt 降序分页
    const countResult = await db.collection('favorites').where({ _openid: OPENID }).count();
    const total = countResult.total;

    const favoritesResult = await db.collection('favorites')
      .where({ _openid: OPENID })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    const favorites = favoritesResult.data;
    const creativityIds = favorites.map(f => f.creativityId).filter(id => !!id);

    if (creativityIds.length === 0) {
      return { code: 0, message: 'ok', data: { list: [], total, hasMore: false } };
    }

    // 关联 creativities 集合拿详情
    const creativitiesResult = await db.collection('creativities')
      .where({ _id: _.in(creativityIds) })
      .get();

    const creativityMap = {};
    const authorOpenids = [];
    creativitiesResult.data.forEach(c => {
      creativityMap[c._id] = c;
      if (c._openid && authorOpenids.indexOf(c._openid) === -1) {
        authorOpenids.push(c._openid);
      }
    });

    // 关联 users 集合查作者信息
    const authorsResult = await db.collection('users')
      .where({ _openid: _.in(authorOpenids) })
      .get();
    const authorMap = {};
    authorsResult.data.forEach(u => {
      authorMap[u._openid] = u;
    });

    // 关联 userLikes 集合查当前用户点赞状态
    const likesResult = await db.collection('userLikes')
      .where({ _openid: OPENID, creativityId: _.in(creativityIds) })
      .get();
    const likeMap = {};
    likesResult.data.forEach(l => {
      likeMap[l.creativityId] = l;
    });

    // 组装列表，按收藏顺序返回
    const list = favorites.map(fav => {
      const creativity = creativityMap[fav.creativityId];
      if (!creativity) {
        return null;
      }
      const author = authorMap[creativity._openid] || null;
      const likeInfo = likeMap[creativity._id];
      return {
        ...creativity,
        author,
        isLiked: likeInfo ? likeInfo.type === 'like' : false,
        isDisliked: likeInfo ? likeInfo.type === 'dislike' : false,
        favoriteId: fav._id,
        favoritedAt: fav.createdAt
      };
    }).filter(item => item !== null);

    const hasMore = skip + favorites.length < total;

    return { code: 0, message: 'ok', data: { list, total, hasMore } };
  } catch (err) {
    console.error('getMyFavorites error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
