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
    // 查询我的有效认领
    const countRes = await db.collection('claims').where({
      openid: OPENID,
      status: 'active'
    }).count()

    const total = countRes.total

    const listRes = await db.collection('claims')
      .where({
        openid: OPENID,
        status: 'active'
      })
      .orderBy('claimedAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const claims = listRes.data

    // 关联查询创意详情
    const creativityIds = [...new Set(claims.map(c => c.creativityId))]
    let creativityMap = {}

    if (creativityIds.length > 0) {
      const creativitiesRes = await db.collection('creativities').where({
        _id: _.in(creativityIds)
      }).get()
      creativityMap = creativitiesRes.data.reduce((acc, cur) => {
        acc[cur._id] = cur
        return acc
      }, {})
    }

    const list = claims.map(claim => ({
      ...claim,
      creativity: creativityMap[claim.creativityId] || null
    }))

    const hasMore = (page - 1) * pageSize + list.length < total

    return { code: 0, message: 'ok', data: { list, total, hasMore } }
  } catch (err) {
    return { code: -1, message: err.message || '查询失败', data: null }
  }
}
