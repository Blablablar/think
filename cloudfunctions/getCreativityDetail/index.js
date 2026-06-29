// 获取创意详情云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const id = event.id;
    if (!id) {
      return { code: -1, message: 'id is required', data: null };
    }

    // 查询单条创意（用 where + get 代替 aggregate）
    const detailResult = await db.collection('creativities')
      .where({ _id: id })
      .get();

    if (!detailResult.data || detailResult.data.length === 0) {
      return { code: -1, message: 'creativity not found', data: null };
    }

    const item = detailResult.data[0];

    // 查询作者信息
    let author = null;
    if (item._openid) {
      const authorResult = await db.collection('users')
        .where({ _openid: item._openid })
        .get();
      if (authorResult.data && authorResult.data.length > 0) {
        author = authorResult.data[0];
      }
    }

    // 查询当前用户的点赞记录
    let likeInfo = null;
    const likeResult = await db.collection('userLikes')
      .where({
        _openid: OPENID,
        creativityId: id
      })
      .get();
    if (likeResult.data && likeResult.data.length > 0) {
      likeInfo = likeResult.data[0];
    }

    const detail = {
      ...item,
      author,
      isLiked: likeInfo ? likeInfo.type === 'like' : false,
      isDisliked: likeInfo ? likeInfo.type === 'dislike' : false
    };

    return { code: 0, message: 'ok', data: detail };
  } catch (err) {
    console.error('getCreativityDetail error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
