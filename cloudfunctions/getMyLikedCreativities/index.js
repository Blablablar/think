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
    // 查询当前用户点赞记录总数
    const countRes = await db.collection('userLikes').where({
      _openid: OPENID,
      type: 'like'
    }).count()
    const total = countRes.total

    if (total === 0) {
      return { code: 0, message: 'ok', data: { list: [], total: 0, hasMore: false } }
    }

    // 分页查询 userLikes（按 createdAt 降序）
    const skip = (page - 1) * pageSize
    const likesRes = await db.collection('userLikes')
      .where({ _openid: OPENID, type: 'like' })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const likes = likesRes.data
    if (!likes || likes.length === 0) {
      return { code: 0, message: 'ok', data: { list: [], total, hasMore: false } }
    }

    const creativityIds = likes.map(item => item.creativityId)

    // 查询 creativities 详情
    const creativitiesRes = await db.collection('creativities').where({
      _id: _.in(creativityIds)
    }).get()

    const creativitiesMap = {}
    creativitiesRes.data.forEach(item => {
      creativitiesMap[item._id] = item
    })

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

    // 按点赞记录顺序组装列表
    const list = likes.map(like => {
      const creativity = creativitiesMap[like.creativityId]
      if (!creativity) return null
      const author = usersMap[creativity._openid] || null
      return {
        ...creativity,
        author,
        likedAt: like.createdAt
      }
    }).filter(Boolean)

    const hasMore = skip + list.length < total

    return { code: 0, message: 'ok', data: { list, total, hasMore } }
  } catch (err) {
    return { code: -1, message: String(err && err.message ? err.message : err), data: null }
  }
}
