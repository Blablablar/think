const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { creativityId } = event

  if (!creativityId) {
    return { code: -1, message: '缺少 creativityId', data: null }
  }

  try {
    // 检查是否已认领
    const existRes = await db.collection('claims').where({
      _openid: OPENID,
      creativityId,
      status: 'active'
    }).get()

    if (existRes.data.length > 0) {
      return { code: -1, message: '您已认领过此创意', data: null }
    }

    // 查询创意作者
    const creativityRes = await db.collection('creativities').doc(creativityId).get()
    const creativity = creativityRes.data

    // 插入认领记录
    const now = new Date()
    const claimRes = await db.collection('claims').add({
      data: {
        _openid: OPENID,
        creativityId,
        status: 'active',
        claimedAt: now,
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // 创意 claimCount +1
    await db.collection('creativities').doc(creativityId).update({
      data: {
        claimCount: _.inc(1)
      }
    })

    // 通知创意作者
    if (creativity && creativity._openid) {
      await db.collection('notifications').add({
        data: {
          _openid: creativity._openid,
          fromOpenid: OPENID,
          type: 'claim',
          creativityId,
          claimId: claimRes._id,
          isRead: false,
          createdAt: now
        }
      })
    }

    return { code: 0, message: 'ok', data: { claimId: claimRes._id } }
  } catch (err) {
    return { code: -1, message: err.message || '认领失败', data: null }
  }
}
