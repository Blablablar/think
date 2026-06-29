const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext()

    const notifications = db.collection('notifications')

    const countRes = await notifications.where({
      _openid: OPENID,
      isRead: false
    }).count()

    return {
      code: 0,
      message: 'ok',
      data: { count: countRes.total }
    }
  } catch (err) {
    return { code: -1, message: String(err.message || err), data: null }
  }
}
