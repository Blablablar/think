const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext()
    const { targetOpenid } = event

    if (!targetOpenid) {
      return { code: -1, message: '缺少 targetOpenid 参数', data: null }
    }

    if (OPENID === targetOpenid) {
      return { code: -1, message: '不能关注自己', data: null }
    }

    const follows = db.collection('follows')
    const notifications = db.collection('notifications')

    const existing = await follows.where({
      follower: OPENID,
      following: targetOpenid
    }).get()

    if (existing.data && existing.data.length > 0) {
      await follows.doc(existing.data[0]._id).remove()
      return { code: 0, message: 'ok', data: { isFollowing: false } }
    } else {
      await follows.add({
        data: {
          follower: OPENID,
          following: targetOpenid,
          createdAt: db.serverDate()
        }
      })
      await notifications.add({
        data: {
          _openid: targetOpenid,
          type: 'follow',
          fromOpenid: OPENID,
          isRead: false,
          createdAt: db.serverDate()
        }
      })
      return { code: 0, message: 'ok', data: { isFollowing: true } }
    }
  } catch (err) {
    return { code: -1, message: String(err.message || err), data: null }
  }
}
