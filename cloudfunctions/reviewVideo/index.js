const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  try {
    const { implId, status } = event

    if (!implId) {
      return { code: -1, message: '缺少 implId 参数', data: null }
    }

    if (status !== 'approved' && status !== 'rejected') {
      return { code: -1, message: 'status 必须为 approved 或 rejected', data: null }
    }

    const implementations = db.collection('implementations')
    const notifications = db.collection('notifications')

    const implRes = await implementations.doc(implId).get()
    const impl = implRes.data

    if (!impl) {
      return { code: -1, message: '实现成果不存在', data: null }
    }

    await implementations.doc(implId).update({
      data: { videoStatus: status }
    })

    const targetType = status === 'approved' ? 'video_approved' : 'video_rejected'
    await notifications.add({
      data: {
        _openid: impl._openid,
        type: targetType,
        implId: implId,
        isRead: false,
        createdAt: db.serverDate()
      }
    })

    return { code: 0, message: 'ok', data: { success: true } }
  } catch (err) {
    return { code: -1, message: String(err.message || err), data: null }
  }
}
