const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id, description, screenshots, videoUrl } = event

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

    // 构造更新数据
    const updateData = {
      updatedAt: new Date()
    }
    if (description !== undefined) {
      updateData.description = description
    }
    if (screenshots !== undefined) {
      updateData.screenshots = screenshots
    }
    if (videoUrl !== undefined) {
      updateData.videoUrl = videoUrl
      // videoUrl 变化则重置审核状态
      if (videoUrl !== impl.videoUrl) {
        updateData.videoStatus = 'pending_review'
      }
    }

    await db.collection('implementations').doc(id).update({
      data: updateData
    })

    return { code: 0, message: 'ok', data: { success: true } }
  } catch (err) {
    return { code: -1, message: err.message || '更新失败', data: null }
  }
}
