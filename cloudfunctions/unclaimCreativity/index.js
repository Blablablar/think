const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { claimId } = event

  if (!claimId) {
    return { code: -1, message: '缺少 claimId', data: null }
  }

  try {
    // 校验认领记录归属
    const claimRes = await db.collection('claims').doc(claimId).get()
    const claim = claimRes.data

    if (!claim) {
      return { code: -1, message: '认领记录不存在', data: null }
    }

    if ((claim.openid || claim._openid) !== OPENID) {
      return { code: -1, message: '无权操作此认领记录', data: null }
    }

    // 更新认领状态
    await db.collection('claims').doc(claimId).update({
      data: {
        status: 'cancelled'
      }
    })

    // 创意 claimCount -1
    await db.collection('creativities').doc(claim.creativityId).update({
      data: {
        claimCount: _.inc(-1)
      }
    })

    return { code: 0, message: 'ok', data: { success: true } }
  } catch (err) {
    return { code: -1, message: err.message || '取消认领失败', data: null }
  }
}
