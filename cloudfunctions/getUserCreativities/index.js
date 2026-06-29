const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { openid } = event
  const page = event.page || 1
  const pageSize = event.pageSize || 10

  if (!openid) {
    return { code: -1, message: '缺少参数 openid', data: null }
  }

  try {
    // 查询目标用户的创意总数
    const countRes = await db.collection('creativities').where({
      _openid: openid
    }).count()
    const total = countRes.total

    if (total === 0) {
      return { code: 0, message: 'ok', data: { list: [], total: 0, hasMore: false } }
    }

    const skip = (page - 1) * pageSize

    // 分页查询 creativities（按 createdAt 降序）
    const creativitiesRes = await db.collection('creativities')
      .where({ _openid: openid })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const list = creativitiesRes.data
    if (!list || list.length === 0) {
      return { code: 0, message: 'ok', data: { list: [], total, hasMore: false } }
    }

    // lookup users 作者信息
    let usersMap = {}
    const usersRes = await db.collection('users').where({
      _openid: openid
    }).get()
    usersRes.data.forEach(item => {
      usersMap[item._openid] = item
    })

    const resultList = list.map(item => ({
      ...item,
      author: usersMap[item._openid] || null
    }))

    const hasMore = skip + resultList.length < total

    return { code: 0, message: 'ok', data: { list: resultList, total, hasMore } }
  } catch (err) {
    return { code: -1, message: String(err && err.message ? err.message : err), data: null }
  }
}
