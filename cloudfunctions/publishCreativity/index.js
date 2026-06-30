// 发布创意云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();

    const content = event.content;
    if (!content) {
      return { code: -1, message: 'content is required', data: null };
    }

    const tags = event.tags;
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return { code: -1, message: 'tags is required', data: null };
    }

    const images = Array.isArray(event.images) ? event.images : [];
    const voiceUrl = event.voiceUrl || '';

    const now = new Date();
    const record = {
      _openid: OPENID,
      openid: OPENID,
      content,
      voiceUrl,
      images,
      tags,
      likeCount: 0,
      dislikeCount: 0,
      claimCount: 0,
      implCount: 0,
      commentCount: 0,
      favoriteCount: 0,
      createdAt: now,
      date: formatDate(now)
    };

    const addResult = await db.collection('creativities').add({ data: record });

    return { code: 0, message: 'ok', data: { _id: addResult._id } };
  } catch (err) {
    console.error('publishCreativity error:', err);
    return { code: -1, message: String(err), data: null };
  }
};
