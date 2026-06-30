const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event

  if (!id) {
    return { code: -1, message: '缺少 id', data: null }
  }

  try {
    // 校验实现成果归属
    const implRes = await db.collection('implementations').doc(id).get()
    const impl = implRes.data

    if (!impl) {
      return { code: -1, message: '实现成果不存在', data: null }
    }
    if ((impl.openid || impl._openid) !== OPENID) {
      return { code: -1, message: '无权操作此实现成果', data: null }
    }

    // 删除记录
    await db.collection('implementations').doc(id).remove()

    // 创意 implCount -1
    await db.collection('creativities').doc(impl.creativityId).update({
      data: {
        implCount: _.inc(-1)
      }
    })

    return { code: 0, message: 'ok', data: { success: true } }
  } catch (err) {
    return { code: -1, message: err.message || '删除失败', data: null }
  }
}
