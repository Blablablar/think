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
    // 查询总数
    const countRes = await db.collection('implementations').where({
      openid: OPENID
    }).count()

    const total = countRes.total

    // 分页查询
    const listRes = await db.collection('implementations')
      .where({
        openid: OPENID
      })
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const list = listRes.data

    // lookup users 拿作者信息
    const openids = [...new Set(list.map(item => item.openid || item._openid))]
    let userMap = {}

    if (openids.length > 0) {
      const usersRes = await db.collection('users').where({
        openid: _.in(openids)
      }).get()
      userMap = usersRes.data.reduce((acc, cur) => {
        acc[cur.openid] = cur
        return acc
      }, {})
    }

    const resultList = list.map(item => ({
      ...item,
      author: userMap[item.openid || item._openid] || null
    }))

    const hasMore = (page - 1) * pageSize + list.length < total

    return { code: 0, message: 'ok', data: { list: resultList, total, hasMore } }
  } catch (err) {
    return { code: -1, message: err.message || '查询失败', data: null }
  }
}
