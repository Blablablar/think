const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext()
    const { id, all } = event

    const notifications = db.collection('notifications')

    if (all === true) {
      await notifications.where({
        _openid: OPENID,
        isRead: false
      }).update({
        data: { isRead: true }
      })
    } else {
      if (!id) {
        return { code: -1, message: '缺少 id 参数', data: null }
      }
      await notifications.doc(id).update({
        data: { isRead: true }
      })
    }

    return { code: 0, message: 'ok', data: { success: true } }
  } catch (err) {
    return { code: -1, message: String(err.message || err), data: null }
  }
}
