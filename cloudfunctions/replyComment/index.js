const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { creativityId, content, parentId, replyTo } = event

  if (!creativityId || !content) {
    return { code: -1, message: '缺少参数 creativityId 或 content', data: null }
  }

  if (!parentId) {
    return { code: -1, message: '缺少参数 parentId', data: null }
  }

  try {
    const result = await db.runTransaction(async transaction => {
      const commentsCol = transaction.collection('comments')
      const creativitiesCol = transaction.collection('creativities')
      const notificationsCol = transaction.collection('notifications')

      // 插入评论记录（parentId 必填）
      const addRes = await commentsCol.add({
        data: {
          _openid: OPENID,
          creativityId: creativityId,
          content: content,
          parentId: parentId,
          replyTo: replyTo || null,
          createdAt: db.serverDate()
        }
      })

      // creativities.commentCount + 1
      await creativitiesCol.doc(creativityId).update({
        data: { commentCount: _.inc(1) }
      })

      // 若 replyTo 存在，查询被回复评论作者并插入通知
      if (replyTo) {
        const repliedRes = await commentsCol.doc(replyTo).get()
        if (repliedRes.data && repliedRes.data._openid && repliedRes.data._openid !== OPENID) {
          await notificationsCol.add({
            data: {
              _openid: repliedRes.data._openid,
              type: 'comment_reply',
              creativityId: creativityId,
              commentId: addRes._id,
              fromOpenid: OPENID,
              replyTo: replyTo,
              isRead: false,
              createdAt: db.serverDate()
            }
          })
        }
      }

      return { _id: addRes._id }
    })

    return { code: 0, message: 'ok', data: result }
  } catch (err) {
    return { code: -1, message: String(err && err.message ? err.message : err), data: null }
  }
}
