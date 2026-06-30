const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { creativityId, page, pageSize } = event
  const pageNum = page || 1
  const pageSizeNum = pageSize || 10

  if (!creativityId) {
    return { code: -1, message: '缺少参数 creativityId', data: null }
  }

  try {
    // 一级评论总数（parentId 为 null）
    const countRes = await db.collection('comments').where({
      creativityId: creativityId,
      parentId: null
    }).count()
    const total = countRes.total

    if (total === 0) {
      return { code: 0, message: 'ok', data: { list: [], total: 0, hasMore: false } }
    }

    const skip = (pageNum - 1) * pageSizeNum

    // 查询一级评论（parentId=null），按 createdAt 升序分页
    const rootCommentsRes = await db.collection('comments')
      .where({ creativityId: creativityId, parentId: null })
      .orderBy('createdAt', 'asc')
      .skip(skip)
      .limit(pageSizeNum)
      .get()

    const rootComments = rootCommentsRes.data
    if (!rootComments || rootComments.length === 0) {
      return { code: 0, message: 'ok', data: { list: [], total, hasMore: false } }
    }

    // 收集所有一级评论 _id
    const rootIds = rootComments.map(item => item._id)

    // 查询这些一级评论的所有子评论（限制每条最多 100 条），按 createdAt 升序
    const repliesRes = await db.collection('comments').where({
      parentId: _.in(rootIds)
    }).orderBy('createdAt', 'asc').limit(100 * rootIds.length).get()

    const replies = repliesRes.data
    const repliesMap = {}
    replies.forEach(item => {
      if (!repliesMap[item.parentId]) repliesMap[item.parentId] = []
      repliesMap[item.parentId].push(item)
    })

    // 收集所有评论作者 openid（一级 + 二级），优先用 openid 字段
    const allComments = [...rootComments, ...replies]
    const authorOpenids = allComments.map(item => item.openid || item._openid).filter(Boolean)
    let usersMap = {}
    if (authorOpenids.length > 0) {
      const uniqueOpenids = Array.from(new Set(authorOpenids))
      const usersRes = await db.collection('users').where({
        openid: _.in(uniqueOpenids)
      }).get()
      usersRes.data.forEach(item => {
        usersMap[item.openid] = item
      })
    }

    // 组装最终结构：每条一级评论挂上其 replies
    const list = rootComments.map(comment => {
      const commentOpenid = comment.openid || comment._openid
      const commentReplies = (repliesMap[comment._id] || []).slice(0, 100).map(reply => ({
        ...reply,
        author: usersMap[reply.openid || reply._openid] || null
      }))
      return {
        ...comment,
        author: usersMap[commentOpenid] || null,
        replies: commentReplies
      }
    })

    const hasMore = skip + list.length < total

    return { code: 0, message: 'ok', data: { list, total, hasMore } }
  } catch (err) {
    return { code: -1, message: String(err && err.message ? err.message : err), data: null }
  }
}
