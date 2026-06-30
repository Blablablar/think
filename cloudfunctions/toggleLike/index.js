const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { creativityId, type } = event

  if (!creativityId || !type) {
    return { code: -1, message: '缺少参数 creativityId 或 type', data: null }
  }

  if (type !== 'like' && type !== 'dislike') {
    return { code: -1, message: 'type 必须为 like 或 dislike', data: null }
  }

  try {
    const result = await db.runTransaction(async transaction => {
      const userLikesCol = transaction.collection('userLikes')
      const creativitiesCol = transaction.collection('creativities')

      // 查询当前用户的点赞/点踩记录
      const myLikeRes = await userLikesCol.where({
        openid: OPENID,
        creativityId: creativityId,
        type: 'like'
      }).get()

      const myDislikeRes = await userLikesCol.where({
        openid: OPENID,
        creativityId: creativityId,
        type: 'dislike'
      }).get()

      const hasLiked = myLikeRes.data && myLikeRes.data.length > 0
      const hasDisliked = myDislikeRes.data && myDislikeRes.data.length > 0

      if (type === 'like') {
        if (hasLiked) {
          // 取消点赞
          await userLikesCol.doc(myLikeRes.data[0]._id).remove()
          await creativitiesCol.doc(creativityId).update({
            data: { likeCount: _.inc(-1) }
          })
        } else {
          // 新增点赞
          await userLikesCol.add({
            data: {
              _openid: OPENID,
              openid: OPENID,
              creativityId: creativityId,
              type: 'like',
              createdAt: db.serverDate()
            }
          })
          await creativitiesCol.doc(creativityId).update({
            data: { likeCount: _.inc(1) }
          })
          // 互斥：若存在反向 dislike 则删除
          if (hasDisliked) {
            await userLikesCol.doc(myDislikeRes.data[0]._id).remove()
            await creativitiesCol.doc(creativityId).update({
              data: { dislikeCount: _.inc(-1) }
            })
          }
        }
      } else {
        // type === 'dislike'
        if (hasDisliked) {
          // 取消点踩
          await userLikesCol.doc(myDislikeRes.data[0]._id).remove()
          await creativitiesCol.doc(creativityId).update({
            data: { dislikeCount: _.inc(-1) }
          })
        } else {
          // 新增点踩
          await userLikesCol.add({
            data: {
              _openid: OPENID,
              openid: OPENID,
              creativityId: creativityId,
              type: 'dislike',
              createdAt: db.serverDate()
            }
          })
          await creativitiesCol.doc(creativityId).update({
            data: { dislikeCount: _.inc(1) }
          })
          // 互斥：若存在反向 like 则删除
          if (hasLiked) {
            await userLikesCol.doc(myLikeRes.data[0]._id).remove()
            await creativitiesCol.doc(creativityId).update({
              data: { likeCount: _.inc(-1) }
            })
          }
        }
      }

      // 重新查询最终状态
      const finalLikeRes = await userLikesCol.where({
        openid: OPENID,
        creativityId: creativityId,
        type: 'like'
      }).get()
      const finalDislikeRes = await userLikesCol.where({
        openid: OPENID,
        creativityId: creativityId,
        type: 'dislike'
      }).get()

      return {
        isLiked: finalLikeRes.data && finalLikeRes.data.length > 0,
        isDisliked: finalDislikeRes.data && finalDislikeRes.data.length > 0
      }
    })

    return { code: 0, message: 'ok', data: result }
  } catch (err) {
    return { code: -1, message: String(err && err.message ? err.message : err), data: null }
  }
}
