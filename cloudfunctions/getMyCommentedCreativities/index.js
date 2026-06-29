const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const page = event.page || 1
  const pageSize = event.pageSize || 10

  try {
    // 查询当前用户的所有评论
    const commentsRes = await db.collection('comments').where({
      _openid: OPENID
    }).get()

    // 去重拿到 creativityId 列表
    const creativityIdSet = new Set()
    commentsRes.data.forEach(item => {
      if (item.creativityId) creativityIdSet.add(item.creativityId)
    })
    const allCreativityIds = Array.from(creativityIdSet)
    const total = allCreativityIds.length

    if (total === 0) {
      return { code: 0, message: 'ok', data: { list: [], total: 0, hasMore: false } }
    }

    // 分页
    const skip = (page - 1) * pageSize
    const pageCreativityIds = allCreativityIds.slice(skip, skip + pageSize)

    if (pageCreativityIds.length === 0) {
      return { code: 0, message: 'ok', data: { list: [], total, hasMore: false } }
    }

    // 查询这些 creativities
    const creativitiesRes = await db.collection('creativities').where({
      _id: _.in(pageCreativityIds)
    }).orderBy('createdAt', 'desc').get()

    // lookup users 作者信息
    const authorOpenids = creativitiesRes.data.map(item => item._openid).filter(Boolean)
    let usersMap = {}
    if (authorOpenids.length > 0) {
      const usersRes = await db.collection('users').where({
        _openid: _.in(authorOpenids)
      }).get()
      usersRes.data.forEach(item => {
        usersMap[item._openid] = item
      })
    }

    const list = creativitiesRes.data.map(item => ({
      ...item,
      author: usersMap[item._openid] || null
    }))

    const hasMore = skip + list.length < total

    return { code: 0, message: 'ok', data: { list, total, hasMore } }
  } catch (err) {
    return { code: -1, message: String(err && err.message ? err.message : err), data: null }
  }
}
