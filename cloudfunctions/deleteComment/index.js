const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event

  if (!id) {
    return { code: -1, message: '缺少参数 id', data: null }
  }

  try {
    const result = await db.runTransaction(async transaction => {
      const commentsCol = transaction.collection('comments')
      const creativitiesCol = transaction.collection('creativities')

      // 查询目标评论
      const commentRes = await commentsCol.doc(id).get()
      const comment = commentRes.data
      if (!comment) {
        throw new Error('评论不存在')
      }

      // 校验权限
      if (comment._openid !== OPENID) {
        throw new Error('无权删除他人评论')
      }

      const creativityId = comment.creativityId
      let decreaseCount = 1

      // 删除该评论
      await commentsCol.doc(id).remove()

      // 若为一级评论，同时删除其所有子评论
      if (!comment.parentId) {
        const repliesRes = await commentsCol.where({
          parentId: id
        }).get()
        const replies = repliesRes.data || []
        for (const reply of replies) {
          await commentsCol.doc(reply._id).remove()
        }
        decreaseCount = 1 + replies.length
      }

      // creativities.commentCount 相应减少
      await creativitiesCol.doc(creativityId).update({
        data: { commentCount: _.inc(-decreaseCount) }
      })

      return { success: true }
    })

    return { code: 0, message: 'ok', data: result }
  } catch (err) {
    return { code: -1, message: String(err && err.message ? err.message : err), data: null }
  }
}
