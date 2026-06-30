const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext()
    const { page = 1, pageSize = 10 } = event
    const skip = (page - 1) * pageSize

    const follows = db.collection('follows')
    const creativities = db.collection('creativities')
    const users = db.collection('users')

    const followsRes = await follows.where({ follower: OPENID }).get()
    const followingList = followsRes.data.map(item => item.following)

    if (followingList.length === 0) {
      return { code: 0, message: 'ok', data: { list: [], total: 0, hasMore: false } }
    }

    const countRes = await creativities.where({
      openid: _.in(followingList)
    }).count()
    const total = countRes.total

    const listRes = await creativities.where({
      openid: _.in(followingList)
    }).orderBy('createdAt', 'desc').skip(skip).limit(pageSize).get()

    const openids = [...new Set(listRes.data.map(item => item.openid || item._openid))]
    const userMap = {}
    if (openids.length > 0) {
      const usersRes = await users.where({ openid: _.in(openids) }).get()
      usersRes.data.forEach(u => {
        userMap[u.openid] = u
      })
    }

    const list = listRes.data.map(item => ({
      ...item,
      author: userMap[item.openid || item._openid] || null
    }))

    const hasMore = skip + list.length < total

    return { code: 0, message: 'ok', data: { list, total, hasMore } }
  } catch (err) {
    return { code: -1, message: String(err.message || err), data: null }
  }
}
