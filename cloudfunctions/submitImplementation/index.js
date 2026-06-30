const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const {
    creativityId,
    claimId,
    description,
    screenshots = [],
    videoUrl
  } = event

  if (!creativityId) {
    return { code: -1, message: '缺少 creativityId', data: null }
  }
  if (!claimId) {
    return { code: -1, message: '缺少 claimId', data: null }
  }
  if (!description) {
    return { code: -1, message: '缺少 description', data: null }
  }

  try {
    // 校验认领记录
    const claimRes = await db.collection('claims').doc(claimId).get()
    const claim = claimRes.data

    if (!claim) {
      return { code: -1, message: '认领记录不存在', data: null }
    }
    if ((claim.openid || claim._openid) !== OPENID) {
      return { code: -1, message: '无权操作此认领记录', data: null }
    }
    if (claim.status !== 'active') {
      return { code: -1, message: '认领记录已失效', data: null }
    }

    // 查询已有版本数
    const countRes = await db.collection('implementations').where({
      claimId
    }).count()

    const version = countRes.total + 1
    const videoStatus = videoUrl ? 'pending_review' : 'approved'
    const now = new Date()

    // 插入实现成果
    const implRes = await db.collection('implementations').add({
      data: {
        creativityId,
        claimId,
        _openid: OPENID,
        openid: OPENID,
        description,
        screenshots,
        videoUrl: videoUrl || '',
        videoStatus,
        version,
        likeCount: 0,
        createdAt: now,
        updatedAt: now
      }
    })

    // 创意 implCount +1
    await db.collection('creativities').doc(creativityId).update({
      data: {
        implCount: _.inc(1)
      }
    })

    // 通知创意作者
    const creativityRes = await db.collection('creativities').doc(creativityId).get()
    const creativity = creativityRes.data
    if (creativity && (creativity.openid || creativity._openid)) {
      await db.collection('notifications').add({
        data: {
          _openid: creativity.openid || creativity._openid,
          openid: creativity.openid || creativity._openid,
          fromOpenid: OPENID,
          type: 'claim',
          creativityId,
          claimId,
          implId: implRes._id,
          isRead: false,
          createdAt: now
        }
      })
    }

    return { code: 0, message: 'ok', data: { implId: implRes._id, version } }
  } catch (err) {
    return { code: -1, message: err.message || '提交失败', data: null }
  }
}
