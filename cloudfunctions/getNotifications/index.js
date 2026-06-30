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

    const notifications = db.collection('notifications')

    const countRes = await notifications.where({ openid: OPENID }).count()
    const total = countRes.total

    const listRes = await notifications.where({ openid: OPENID })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const hasMore = skip + listRes.data.length < total

    return {
      code: 0,
      message: 'ok',
      data: { list: listRes.data, total, hasMore }
    }
  } catch (err) {
    return { code: -1, message: String(err.message || err), data: null }
  }
}
